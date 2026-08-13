import { useMemo, useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import twrnc from 'twrnc';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { apiGet, apiPut } from '@/src/lib/api';
import { showPlatformAlert } from '@/src/utils/alert';

import { Skeleton } from '@/components/ui/skeleton';
import {
  HeroCarousel,
  QuickActionMenu,
  ActiveBookingCard,
  BookingModal,
  ActiveBookingModal,
  SuccessModal,
} from '@/src/features/home/components';

import { useServices } from '@/src/hooks/useServices';
import { useBookings } from '@/src/hooks/useBookings';
import { useBookingSlots } from '@/src/hooks/useBookingSlots';
import { useGlobalVehicles } from '@/src/context/VehicleContext';

export default function HomeScreen() {
  const tw = twrnc;

  // Modals state
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isActiveBookingModalVisible, setIsActiveBookingModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Tangkap query param jika kembali dari Midtrans web (redirect) menggunakan Global Params
  const { transaction_status, order_id } = useGlobalSearchParams<{ transaction_status?: string, order_id?: string }>();

  // Booking selections
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Custom Hooks
  const { services, isLoading, error, loadServices } = useServices();
  const { vehicles, loadVehicles, activeVehicleId, setActiveVehicleId } = useGlobalVehicles();

  useFocusEffect(
    useCallback(() => {
      // Re-fetch only if needed, but Context handles initial load
      // loadVehicles();
    }, [])
  );
  
  const { 
    hasActiveBooking, 
    activeBookingLabel, 
    activeBookingStatus, 
    activeBookingDetails,
    bookingError,
    isSubmitting,
    submitBooking,
    setBookingError,
    reloadBookings
  } = useBookings(services);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadVehicles(),
      reloadBookings(),
      loadServices()
    ]);
    setRefreshing(false);
  }, [loadVehicles, reloadBookings, loadServices]);

  // Efek khusus untuk Auto-Sync di mode Web
  useEffect(() => {
    const handleWebAutoSync = async () => {
      // Jika ada order_id berawalan BOOK-, berarti user baru kembali dari Midtrans
      if (order_id && order_id.startsWith('BOOK-')) {
        const id = order_id.split('-')[1];
        try {
          await apiGet(`/payments/${id}/sync-status`);
          await reloadBookings();
          
          // Bersihkan parameter dari URL agar tidak terpanggil ulang (khusus web)
          router.replace('/(tabs)');
        } catch (e) {
          console.error('Web auto-sync failed', e);
        }
      }
    };
    handleWebAutoSync();
  }, [transaction_status, order_id]);

  const selectedDateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const { slotOptions, isSlotsLoading } = useBookingSlots(
    isBookingModalVisible,
    selectedServiceId,
    selectedDateString
  );

  const dateOptions = useMemo(() => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        date,
        dayName: dayNames[date.getDay()],
        dateNumber: date.getDate(),
      };
    });
  }, []);

  const menuItems = useMemo(
    () => [
      { label: 'Pesan Servis', icon: 'calendar-today', action: 'booking' },
      { label: 'Riwayat Servis', icon: 'history', action: 'history' },
      { label: 'Katalog', icon: 'shopping-bag', action: 'catalog' },
      { label: 'Trade In', icon: 'swap-horiz', action: 'tradein' },
      { label: 'Emergency', icon: 'warning', action: 'emergency' },
      { label: 'Produk', icon: 'inventory', action: 'produk' },
      { label: 'Test Drive', icon: 'directions-car', action: 'testdrive' },
      { label: 'Lainnya', icon: 'grid-view', action: 'more' },
    ],
    []
  );

  // Default selection for modal
  useEffect(() => {
    if (isBookingModalVisible && !selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
  }, [isBookingModalVisible, selectedServiceId, services]);

  // Reset errors/slots on date/service change
  useEffect(() => {
    if (isBookingModalVisible) {
      setBookingError('');
      setSelectedSlot('');
    }
  }, [isBookingModalVisible, selectedServiceId, selectedDateString, setBookingError]);

  const handleMenuAction = (action: string) => {
    const routes: Record<string, string> = {
      history: '/(tabs)/service-history',
      catalog: '/(tabs)/spareparts',
      produk: '/(tabs)/produk',
      testdrive: '/(tabs)/test-drive',
      tradein: '/(tabs)/trade-in',
      emergency: '/(tabs)/emergency',
      more: '/(tabs)/more'
    };

    if (action === 'booking') {
      setIsBookingModalVisible(true);
      setBookingError('');
      return;
    }

    if (routes[action]) {
      router.push(routes[action] as any);
    }
  };

  const handleConfirmBooking = () => {
    submitBooking(selectedServiceId, selectedVehicleId, selectedDateString, selectedSlot, (bookingId: number) => {
      setIsBookingModalVisible(false);
      setIsSuccessModalVisible(true);
    });
  };

  const formatScheduleDisplay = (scheduledAt: string) => {
    return scheduledAt ? scheduledAt.replace('T', ' ') : '-';
  };

  const handleCheckStatus = async () => {
    if (!activeBookingDetails?.id) return;
    
    setIsCheckingStatus(true);
    try {
      await apiGet(`/payments/${activeBookingDetails.id}/sync-status`);
      await reloadBookings();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFinishBooking = async () => {
    if (!activeBookingDetails?.id) return;
    try {
      // Ubah status ke completed agar hilang dari beranda dan dianggap selesai
      await apiPut(`/bookings/${activeBookingDetails.id}`, { status: 'completed' });
      setIsActiveBookingModalVisible(false);
      await reloadBookings();
    } catch (e) {
      console.error('Failed to complete booking', e);
      setIsActiveBookingModalVisible(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView 
        style={tw`flex-1 bg-white`} 
        contentContainerStyle={tw`pb-8 bg-white`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} />
        }
      >
        <View style={tw`px-5 pt-6`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`items-center`}>
                <Ionicons name="scan-outline" size={20} color="#111827" />
                <Text style={tw`mt-1 text-[10px] text-slate-700`}>SCAN QR</Text>
              </View>
              <Text style={tw`text-lg font-bold text-slate-900`}>GarageFlow</Text>
              <Pressable style={tw`h-10 w-10 items-center justify-center`}>
                <Ionicons name="mail-outline" size={20} color="#111827" />
              </Pressable>
            </View>

            <HeroCarousel
              vehicles={vehicles}
              activeVehicleId={activeVehicleId}
              onHeroImagePress={() => {
                 if (vehicles.length > 1) {
                    const currentIndex = vehicles.findIndex(v => v.id === activeVehicleId);
                    const nextIndex = (currentIndex + 1) % vehicles.length;
                    setActiveVehicleId(vehicles[nextIndex].id);
                 }
              }}
              onAddVehiclePress={() => router.push('/(tabs)/my-car')}
            />

            <QuickActionMenu
              menuItems={menuItems}
              onMenuAction={handleMenuAction}
            />

            {hasActiveBooking ? (
              <ActiveBookingCard
                activeBookingLabel={activeBookingLabel}
                activeBookingStatus={activeBookingStatus}
                onPress={() => setIsActiveBookingModalVisible(true)}
              />
            ) : null}

            <View style={tw`mt-6 mb-3`}>
              <Text style={tw`text-base font-semibold text-slate-900`}>Informasi Layanan Servis</Text>
              <Text style={tw`text-xs text-slate-500 mt-1`}>Kenali kategori servis untuk perawatan optimal kendaraan Anda.</Text>
            </View>

            {isLoading ? (
              <View style={tw`mt-2`}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={tw`mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`}>
                    <Skeleton className="h-5 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </View>
                ))}
              </View>
            ) : null}

            {!isLoading && error ? (
              <Text style={tw`mt-4 text-red-600`}>{error}</Text>
            ) : null}

            {!isLoading && !error && services.length === 0 ? (
              <Text style={tw`mt-4 text-slate-600`}>Belum ada layanan.</Text>
            ) : null}

            {!isLoading && services.length > 0 ? (
              <View style={tw`mt-2`}>
                {services.map((service) => (
                  <View
                    key={service.id}
                    style={tw`mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`}>
                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <Text style={tw`text-lg font-bold text-slate-900`}>{service.name}</Text>
                      <View style={tw`bg-red-50 px-2 py-1 rounded-md`}>
                        <Text style={tw`text-xs font-medium text-red-700`}>±{service.estimated_duration || 60} menit</Text>
                      </View>
                    </View>
                    
                    <Text style={tw`text-sm text-slate-600 leading-relaxed mb-4`}>
                      {service.description || 'Deskripsi tidak tersedia.'}
                    </Text>

                    <Pressable
                      onPress={() => {
                        setSelectedServiceId(service.id);
                        setIsBookingModalVisible(true);
                      }}
                      style={tw`bg-red-600 rounded-xl py-3 items-center shadow-sm`}
                    >
                      <Text style={tw`text-white font-bold`}>Pilih & Pesan</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

        </View>
      </ScrollView>
      
      <BookingModal
        visible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        services={services}
        selectedServiceId={selectedServiceId}
        onSelectService={setSelectedServiceId}
        dateOptions={dateOptions}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        slotOptions={slotOptions}
        isSlotsLoading={isSlotsLoading}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        bookingError={bookingError}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmBooking}
      />
      <ActiveBookingModal
        visible={isActiveBookingModalVisible}
        onClose={() => setIsActiveBookingModalVisible(false)}
        details={activeBookingDetails}
        formatScheduleDisplay={formatScheduleDisplay}
        onContinuePayment={() => {
          setIsActiveBookingModalVisible(false);
          if (activeBookingDetails?.id) {
            router.push(`/payment?booking_id=${activeBookingDetails.id}`);
          }
        }}
        isCheckingStatus={isCheckingStatus}
        onCheckStatus={handleCheckStatus}
        onFinish={handleFinishBooking}
      />
      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
      />
    </View>
  );
}
