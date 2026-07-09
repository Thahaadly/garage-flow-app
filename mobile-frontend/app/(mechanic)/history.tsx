import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import twrnc from 'twrnc';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '@/src/lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function MechanicHistory() {
  const tw = twrnc;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiGet<any>('/mechanic/bookings/history');
      setBookings(res ?? []);
    } catch (e: any) {
      console.warn('fetchHistory error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  if (loading) return <ActivityIndicator style={tw`flex-1 mt-20`} />;

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <View style={tw`bg-[#740505] pt-16 pb-6 px-6 rounded-b-[40px] shadow-lg`}>
        <Text style={tw`text-white text-3xl font-bold`}>Riwayat Pekerjaan</Text>
        <Text style={tw`text-white/80 mt-1`}>Daftar servis yang telah Anda selesaikan</Text>
      </View>

      <ScrollView 
        contentContainerStyle={tw`p-6 pb-32`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#740505']} />}
      >
        {bookings.length === 0 ? (
          <View style={tw`items-center justify-center py-20`}>
            <Ionicons name="time-outline" size={80} color="#cbd5e1" />
            <Text style={tw`text-slate-500 mt-4 text-lg font-bold`}>Belum ada riwayat pekerjaan</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 opacity-80`}>
              <View style={tw`flex-row justify-between items-start mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`font-bold text-lg text-slate-800`}>{booking.vehicle?.brand} {booking.vehicle?.model}</Text>
                  <Text style={tw`text-slate-500 text-sm`}>{booking.vehicle?.license_plate} • {booking.service?.name}</Text>
                </View>
                <View style={tw`px-3 py-1 rounded-full ml-2 bg-slate-100`}>
                  <Text style={tw`text-xs font-bold text-slate-500`}>Selesai</Text>
                </View>
              </View>

              <View style={tw`bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 flex-row justify-between items-center`}>
                <Text style={tw`text-xs text-slate-500`}>TANGGAL SELESAI</Text>
                <Text style={tw`text-sm font-semibold text-slate-700`}>
                  {new Date(booking.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>

              <Text style={tw`text-slate-600 font-medium`}>👤 Pelanggan: {booking.user?.name}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
