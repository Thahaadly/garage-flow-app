import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import twrnc from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';

import { apiGet, getApiErrorMessage } from '@/src/lib/api';
import type { Booking } from '@/src/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah, formatIndonesianDate } from '@/src/utils/format';
import { ActiveBookingModal } from '@/src/features/home/components';

export default function ServiceHistoryScreen() {
  const tw = twrnc;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const loadBookings = useCallback(async () => {
    setError('');

    try {
      const response = await apiGet<Booking[]>('/bookings');
      setBookings(response ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat riwayat servis.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const getStatusBadge = (status: string | undefined | null) => {
    switch (status) {
      case 'pending':
      case 'pending_payment':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          label: 'Menunggu',
          icon: 'time-outline' as const,
        };
      case 'confirmed':
      case 'paid':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          label: 'Lunas / Aktif',
          icon: 'checkmark-circle-outline' as const,
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          label: 'Selesai',
          icon: 'flag-outline' as const,
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Dibatalkan',
          icon: 'close-circle-outline' as const,
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          label: status || '-',
          icon: 'help-circle-outline' as const,
        };
    }
  };

  return (
    <View style={tw`flex-1 bg-[#f8fafc]`}>
      {/* Header Background */}
      <View style={tw`bg-[#740505] px-6 pb-6 pt-12 rounded-b-3xl shadow-lg z-10`}>
        <Text style={tw`text-2xl font-bold text-white tracking-tight`}>Riwayat Servis</Text>
        <Text style={tw`mt-1 text-sm text-white/80`}>
          Pantau status dan catatan perawatan kendaraan Anda.
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={tw`px-5 pt-6 pb-10`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#740505']} />
        }
      >
        {isLoading ? (
          <View style={tw`mt-2`}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={tw`mt-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100`}>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Skeleton className="h-5 w-1/2 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </View>
                <Skeleton className="h-3 w-1/3 rounded-md mb-2" />
                <Skeleton className="h-3 w-1/4 rounded-md" />
              </View>
            ))}
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={tw`mt-10 items-center justify-center p-6 bg-red-50 rounded-2xl border border-red-100`}> 
            <Ionicons name="alert-circle" size={40} color="#dc2626" style={tw`mb-3`} />
            <Text style={tw`text-sm font-medium text-red-600 text-center`}>{error}</Text>
            <Pressable onPress={loadBookings} style={tw`mt-4 bg-white px-5 py-2 rounded-full shadow-sm border border-red-200`}> 
              <Text style={tw`text-sm font-bold text-red-600`}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && bookings.length === 0 ? (
          <View style={tw`mt-12 items-center justify-center`}>
            <View style={tw`h-24 w-24 bg-slate-100 rounded-full items-center justify-center mb-4`}>
              <Ionicons name="document-text-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={tw`text-lg font-bold text-slate-800`}>Belum Ada Riwayat</Text>
            <Text style={tw`text-sm text-slate-500 mt-1 text-center px-4`}>
              Anda belum pernah memesan servis sebelumnya.
            </Text>
          </View>
        ) : null}

        {!isLoading && !error && bookings.map((booking) => {
          const serviceName = booking.service?.name ?? 'Servis Khusus';
          const badge = getStatusBadge(booking.status);

          return (
            <Pressable
              onPress={() => setSelectedBooking(booking)}
              key={booking.id}
              style={tw`mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-100 overflow-hidden`}>
              {/* Top Section */}
              <View style={tw`flex-row items-start justify-between border-b border-slate-100 pb-3 mb-3`}>
                <View style={tw`flex-1 pr-4`}>
                  <Text style={tw`text-lg font-bold text-slate-900 mb-1`} numberOfLines={1}>
                    {serviceName}
                  </Text>
                  <Text style={tw`text-xs font-medium text-slate-500 uppercase tracking-wider`}>
                    ID: BOOK-{booking.id?.toString().padStart(4, '0')}
                  </Text>
                </View>
                <View style={tw`${badge.bg} px-3 py-1.5 rounded-full flex-row items-center`}>
                  <Ionicons name={badge.icon} size={12} style={tw`${badge.text} mr-1`} />
                  <Text style={tw`text-[11px] font-bold ${badge.text}`}>{badge.label}</Text>
                </View>
              </View>

              {/* Bottom Section */}
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`bg-slate-50 h-10 w-10 rounded-full items-center justify-center mr-3`}>
                    <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  </View>
                  <View>
                    <Text style={tw`text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5`}>
                      Jadwal Servis
                    </Text>
                    <Text style={tw`text-xs font-bold text-slate-700`}>
                      {formatIndonesianDate(booking.booking_date)}
                    </Text>
                  </View>
                </View>
                
                <View style={tw`items-end`}>
                  <Text style={tw`text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5`}>
                    Total
                  </Text>
                  <Text style={tw`text-sm font-bold text-[#740505]`}>
                    {formatRupiah(booking.total_price)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ActiveBookingModal
        visible={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        details={selectedBooking ? {
          id: selectedBooking.id,
          serviceName: selectedBooking.service?.name ?? 'Servis Khusus',
          scheduledAt: selectedBooking.booking_date,
          status: selectedBooking.status,
          total_price: selectedBooking.total_price,
          items: selectedBooking.items,
        } : null}
        formatScheduleDisplay={formatIndonesianDate}
        onContinuePayment={() => {
          setSelectedBooking(null);
          router.push(`/payment?booking_id=${selectedBooking.id}`);
        }}
      />
    </View>
  );
}
