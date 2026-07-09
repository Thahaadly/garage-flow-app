import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import twrnc from 'twrnc';
import { apiPost, apiGet } from '@/src/lib/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showPlatformAlert } from '@/src/utils/alert';

type SnapResponse = {
  data: {
    snap_token: string;
    order_id: string;
    client_key: string;
  };
};

export default function PaymentScreen() {
  const { booking_id } = useLocalSearchParams<{ booking_id: string }>();
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking_id) {
      setError('ID Booking tidak ditemukan');
      setIsLoading(false);
      return;
    }

    const fetchSnapToken = async () => {
      try {
        const response = await apiPost<SnapResponse>('/payments/transaction', {
          booking_id: booking_id,
        });

        if (response.data?.data?.snap_token) {
          setSnapToken(response.data.data.snap_token);
          setClientKey(response.data.data.client_key);
        } else {
          setError('Gagal mendapatkan token pembayaran dari server.');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Terjadi kesalahan saat memuat pembayaran.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnapToken();
  }, [booking_id]);

  useEffect(() => {
    if (Platform.OS === 'web' && snapToken && clientKey) {
      const openMidtransSnap = () => {
        if ((window as any).snap) {
          (window as any).snap.pay(snapToken, {
            onSuccess: async function (result: any) {
              // Local Dev: Sync status manually before redirecting
              try {
                await apiGet(`/payments/${booking_id}/sync-status`);
              } catch {}
              router.replace('/(tabs)');
            },
            onPending: async function (result: any) {
              try {
                await apiGet(`/payments/${booking_id}/sync-status`);
              } catch {}
              router.replace('/(tabs)');
            },
            onError: function (result: any) {
              showPlatformAlert('Gagal', 'Pembayaran gagal.');
              router.back();
            },
            onClose: function () {
              router.back();
            }
          });
        }
      };

      const scriptId = 'midtrans-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        
        script.onload = () => {
          openMidtransSnap();
        };
        
        document.body.appendChild(script);
      } else {
        openMidtransSnap();
      }
    }
  }, [snapToken, clientKey, booking_id]);

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes('transaction_status=settlement') || navState.url.includes('transaction_status=capture')) {
      // For local development, sync manually since webhooks might not reach local IP
      apiGet(`/payments/${booking_id}/sync-status`).catch(() => {});
      
      showPlatformAlert('Sukses', 'Pembayaran berhasil diselesaikan!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } else if (navState.url.includes('transaction_status=cancel') || navState.url.includes('transaction_status=deny')) {
      apiGet(`/payments/${booking_id}/sync-status`).catch(() => {});
      
      showPlatformAlert('Batal', 'Pembayaran dibatalkan atau ditolak.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={twrnc`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#0f172a" />
        <ThemedText style={twrnc`mt-4 text-slate-600`}>Menyiapkan pembayaran...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={twrnc`flex-1 items-center justify-center bg-white px-6`}>
        <ThemedText style={twrnc`text-center text-red-600 font-semibold mb-4`}>{error}</ThemedText>
        <ThemedText 
          style={twrnc`text-center text-blue-600 font-bold`} 
          onPress={() => router.back()}
        >
          Kembali
        </ThemedText>
      </ThemedView>
    );
  }

  if (snapToken) {
    if (Platform.OS === 'web') {
      return (
        <ThemedView style={twrnc`flex-1 items-center justify-center bg-white`}>
          <ActivityIndicator size="large" color="#0f172a" />
          <ThemedText style={twrnc`mt-4 text-slate-600`}>Menunggu pembayaran...</ThemedText>
        </ThemedView>
      );
    }

    const snapUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: snapUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, twrnc`items-center justify-center bg-white`]}>
              <ActivityIndicator size="large" color="#0f172a" />
            </View>
          )}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
