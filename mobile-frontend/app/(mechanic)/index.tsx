import { View, Text, ScrollView, ActivityIndicator, Pressable, TextInput, Modal, RefreshControl } from 'react-native';
import twrnc from 'twrnc';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiGet, apiPost } from '@/src/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { showPlatformAlert } from '@/src/utils/alert';

export default function MechanicDashboard() {
  const tw = twrnc;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Inspection State
  const [items, setItems] = useState<{item_name: string, type: 'part'|'service', price: string, quantity: string}[]>([]);
  
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiGet<any>('/mechanic/bookings');
      setBookings(res ?? []);
    } catch (e: any) {
      console.warn('fetchBookings error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  const openInspection = (booking: any) => {
    setSelectedBooking(booking);
    setItems([{ item_name: 'Jasa Pengecekan', type: 'service', price: '50000', quantity: '1' }]);
  };

  const addItem = () => {
    setItems([...items, { item_name: '', type: 'part', price: '', quantity: '1' }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const submitInspection = async () => {
    try {
      const payloadItems = items.map(it => ({
        ...it,
        price: parseFloat(it.price) || 0,
        quantity: parseInt(it.quantity) || 1
      }));

      await apiPost(`/mechanic/bookings/${selectedBooking.id}/items`, { items: payloadItems });
      showPlatformAlert("Sukses", "Tagihan berhasil dikirim ke pelanggan!");
      setSelectedBooking(null);
      fetchBookings();
    } catch (e: any) {
      showPlatformAlert("Error", e.response?.data?.message || "Gagal mengirim tagihan");
    }
  };
  
  const markAsCompleted = async (id: number) => {
      try {
        await apiPost(`/mechanic/bookings/${id}/status`, { status: 'completed' });
        showPlatformAlert("Sukses", "Servis selesai!");
        fetchBookings();
      } catch {
        showPlatformAlert("Error", "Gagal update status");
      }
  };

  if (loading) return <ActivityIndicator style={tw`flex-1 mt-20`} />;

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <View style={tw`bg-[#740505] pt-16 pb-6 px-6 rounded-b-[40px] shadow-lg`}>
        <Text style={tw`text-white text-3xl font-bold`}>Dashboard Mekanik</Text>
        <Text style={tw`text-white/80 mt-1`}>Daftar antrean servis hari ini</Text>
      </View>

      <ScrollView 
        contentContainerStyle={tw`p-6 pb-32`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#740505']} />}
      >
        {bookings.length === 0 ? (
          <View style={tw`items-center justify-center py-20`}>
            <Ionicons name="checkmark-circle-outline" size={80} color="#cbd5e1" />
            <Text style={tw`text-slate-500 mt-4 text-lg font-bold`}>Tidak ada antrean saat ini</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}>
              <View style={tw`flex-row justify-between items-start mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`font-bold text-lg text-slate-800`}>{booking.vehicle?.brand} {booking.vehicle?.model}</Text>
                  <Text style={tw`text-slate-500 text-sm`}>{booking.vehicle?.license_plate} • {booking.service?.name}</Text>
                </View>
                <View style={tw`px-3 py-1 rounded-full ml-2 ${booking.status === 'scheduled' ? 'bg-amber-100' : booking.status === 'confirmed' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <Text style={tw`text-xs font-bold ${booking.status === 'scheduled' ? 'text-amber-700' : booking.status === 'confirmed' ? 'text-blue-700' : 'text-green-700'}`}>
                    {booking.status === 'scheduled' ? 'Menunggu Inspeksi' : booking.status === 'confirmed' ? 'Siap Dikerjakan' : booking.status}
                  </Text>
                </View>
              </View>

              <View style={tw`bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100`}>
                <Text style={tw`text-xs text-slate-500 mb-1`}>INFORMASI KENDARAAN</Text>
                <View style={tw`flex-row justify-between`}>
                  <View>
                    <Text style={tw`text-[10px] text-slate-400`}>TAHUN</Text>
                    <Text style={tw`text-sm font-semibold text-slate-700`}>{booking.vehicle?.year || '-'}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-[10px] text-slate-400`}>ODOMETER</Text>
                    <Text style={tw`text-sm font-semibold text-slate-700`}>{booking.vehicle?.mileage || 0} km</Text>
                  </View>
                  <View>
                    <Text style={tw`text-[10px] text-slate-400`}>AKI / BAN</Text>
                    <Text style={tw`text-sm font-semibold text-slate-700`}>
                      {booking.vehicle?.battery_health === 'Good' ? '✅' : '⚠️'} / {booking.vehicle?.tire_condition}%
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={tw`text-slate-600 mb-4 font-medium`}>👤 Pelanggan: {booking.user?.name}</Text>

              {booking.status === 'scheduled' && (
                <Pressable onPress={() => openInspection(booking)} style={tw`bg-amber-500 p-3 rounded-2xl items-center`}>
                  <Text style={tw`text-white font-bold`}>Inspeksi & Buat Tagihan</Text>
                </Pressable>
              )}
              {booking.status === 'confirmed' && (
                <Pressable onPress={() => markAsCompleted(booking.id)} style={tw`bg-blue-600 p-3 rounded-2xl items-center`}>
                  <Text style={tw`text-white font-bold`}>Tandai Selesai (Completed)</Text>
                </Pressable>
              )}
              {booking.status === 'pending_payment' && (
                <View style={tw`bg-slate-100 p-3 rounded-2xl items-center`}>
                  <Text style={tw`text-slate-500 font-bold`}>Menunggu Pembayaran Pelanggan</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Inspection Modal */}
      <Modal visible={!!selectedBooking} animationType="slide" presentationStyle="pageSheet">
        <View style={tw`flex-1 bg-slate-50`}>
          <View style={tw`p-6 bg-white border-b border-slate-200 flex-row justify-between items-center`}>
            <Text style={tw`text-xl font-bold`}>Input Tagihan Servis</Text>
            <Pressable onPress={() => setSelectedBooking(null)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>
          
          <ScrollView contentContainerStyle={tw`p-6 pb-32`}>
            <Text style={tw`font-bold text-slate-800 mb-4`}>Daftar Komponen & Jasa</Text>
            
            {items.map((item, index) => (
              <View key={index} style={tw`bg-white p-4 rounded-2xl mb-4 shadow-sm border border-slate-100`}>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`font-bold text-slate-700`}>Item #{index + 1}</Text>
                  {index > 0 && (
                    <Pressable onPress={() => removeItem(index)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </Pressable>
                  )}
                </View>

                <TextInput 
                  placeholder="Nama Part / Jasa" 
                  value={item.item_name}
                  onChangeText={(val) => updateItem(index, 'item_name', val)}
                  style={tw`border border-slate-200 rounded-xl p-3 mb-2 bg-slate-50`}
                />
                <View style={tw`flex-row mb-2`}>
                   <Pressable 
                      onPress={() => updateItem(index, 'type', 'part')}
                      style={tw`flex-1 py-2 items-center rounded-l-xl border border-slate-200 ${item.type === 'part' ? 'bg-[#740505]' : 'bg-white'}`}>
                      <Text style={tw`font-bold ${item.type === 'part' ? 'text-white' : 'text-slate-500'}`}>Suku Cadang</Text>
                   </Pressable>
                   <Pressable 
                      onPress={() => updateItem(index, 'type', 'service')}
                      style={tw`flex-1 py-2 items-center rounded-r-xl border border-slate-200 border-l-0 ${item.type === 'service' ? 'bg-[#740505]' : 'bg-white'}`}>
                      <Text style={tw`font-bold ${item.type === 'service' ? 'text-white' : 'text-slate-500'}`}>Jasa</Text>
                   </Pressable>
                </View>
                <View style={tw`flex-row gap-2`}>
                  <TextInput 
                    placeholder="Harga Satuan" 
                    keyboardType="numeric"
                    value={item.price}
                    onChangeText={(val) => updateItem(index, 'price', val)}
                    style={tw`flex-2 border border-slate-200 rounded-xl p-3 bg-slate-50`}
                  />
                  <TextInput 
                    placeholder="Qty" 
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(val) => updateItem(index, 'quantity', val)}
                    style={tw`flex-1 border border-slate-200 rounded-xl p-3 bg-slate-50`}
                  />
                </View>
              </View>
            ))}

            <Pressable onPress={addItem} style={tw`border-2 border-dashed border-slate-300 p-4 rounded-2xl items-center mb-8`}>
              <Text style={tw`text-slate-500 font-bold`}>+ Tambah Item</Text>
            </Pressable>

            <Pressable onPress={submitInspection} style={tw`bg-[#740505] p-4 rounded-2xl items-center shadow-lg`}>
              <Text style={tw`text-white font-bold text-lg`}>Kirim Tagihan ke Pelanggan</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
