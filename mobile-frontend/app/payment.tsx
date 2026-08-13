import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import twrnc from 'twrnc';
import { apiPost, apiGet } from '@/src/lib/api';
import * as Linking from 'expo-linking';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showPlatformAlert } from '@/src/utils/alert';
import { Ionicons } from '@expo/vector-icons';

type SnapResponse = {
  data: {
    snap_token: string;
    order_id: string;
    client_key: string;
    redirect_url?: string;
  };
};

export default function PaymentScreen() {
  const { booking_id } = useLocalSearchParams<{ booking_id: string }>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
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
        // Create return URL dynamically based on platform
        let returnUrl = '';
        if (Platform.OS === 'web') {
          returnUrl = window.location.origin + '/';
        } else {
          returnUrl = Linking.createURL('/');
        }

        // Buat transaksi untuk mendapatkan redirect_url
        const response = await apiPost<SnapResponse>('/payments/transaction', {
          booking_id: booking_id,
          return_url: returnUrl
        });

        if (response.data?.data?.snap_token) {
          if (response.data.data.redirect_url) {
            setRedirectUrl(response.data.data.redirect_url);
          } else {
            // Fallback manually construct URL just in case
            const isProd = response.data.data.client_key && !response.data.data.client_key.startsWith('SB-');
            setRedirectUrl(isProd 
              ? `https://app.midtrans.com/snap/v2/vtweb/${response.data.data.snap_token}`
              : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${response.data.data.snap_token}`);
          }
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



  const handleNavigationStateChange = async (navState: any) => {
    if (navState.url.includes('transaction_status=settlement') || navState.url.includes('transaction_status=capture')) {
      // Otomatis sinkronisasi status ke backend saat Midtrans melempar URL sukses (Bypass Lokal)
      try {
        if (booking_id) {
          await apiGet(`/payments/${booking_id}/sync-status`);
        }
      } catch (e) {
        console.error('Auto-sync failed:', e);
      }

      router.replace('/(tabs)');
    } else if (navState.url.includes('transaction_status=cancel') || navState.url.includes('transaction_status=deny')) {
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

  if (redirectUrl) {
    if (Platform.OS === 'web') {
      window.location.href = redirectUrl;
      return (
        <ThemedView style={twrnc`flex-1 items-center justify-center bg-white`}>
          <ActivityIndicator size="large" color="#0f172a" />
          <ThemedText style={twrnc`mt-4 text-slate-600`}>Mengarahkan ke halaman pembayaran Midtrans...</ThemedText>
        </ThemedView>
      );
    }

    return (
      <View style={styles.container}>
        {/* Header Bar untuk WebView (Mobile Only) */}
        {Platform.OS !== 'web' && (
          <View style={tw`h-14 bg-white border-b border-slate-200 flex-row items-center px-4 pt-1 shadow-sm`}>
            <Ionicons name="arrow-back" size={24} color="#dc2626" onPress={() => router.back()} />
            <ThemedText style={tw`text-slate-800 font-bold ml-3 text-lg flex-1`}>
              Pembayaran
            </ThemedText>
            <ThemedText 
              style={tw`text-red-600 font-bold text-sm`} 
              onPress={() => {
                showPlatformAlert('Batal', 'Yakin ingin membatalkan pembayaran saat ini?', [
                  { text: 'Tidak', style: 'cancel' },
                  { text: 'Ya, Batal', style: 'destructive', onPress: () => router.back() }
                ]);
              }}
            >
              Batal
            </ThemedText>
          </View>
        )}
        <WebView
          source={{ uri: redirectUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, twrnc`items-center justify-center bg-white`]}>
              <ActivityIndicator size="large" color="#dc2626" />
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
