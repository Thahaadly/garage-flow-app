import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import twrnc from 'twrnc';
import type { Service, Vehicle } from '@/src/types';
import { Skeleton } from '@/components/ui/skeleton';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type DateOption = {
  date: Date;
  dayName: string;
  dateNumber: number;
};

type SlotOption = {
  start: string;
  end: string;
  available: boolean;
};

type BookingModalProps = {
  visible: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedVehicleId: number | null;
  onSelectVehicle: (id: number) => void;
  services: Service[];
  selectedServiceId: number | null;
  onSelectService: (id: number) => void;
  dateOptions: DateOption[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  slotOptions: SlotOption[];
  isSlotsLoading: boolean;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  bookingError: string;
  isSubmitting: boolean;
  onConfirm: () => void;
};

export function BookingModal({
  visible,
  onClose,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  services,
  selectedServiceId,
  onSelectService,
  dateOptions,
  selectedDate,
  onSelectDate,
  slotOptions,
  isSlotsLoading,
  selectedSlot,
  onSelectSlot,
  bookingError,
  isSubmitting,
  onConfirm,
}: BookingModalProps) {
  const tw = twrnc;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={tw`flex-1 justify-end`}>
        <Pressable
          style={tw`flex-1 bg-black/40`}
          onPress={onClose}
        />
        <View style={tw`rounded-t-3xl bg-white p-6`}>
          <View style={tw`w-full max-w-md mx-auto`}>
            <Text style={tw`text-base font-semibold text-slate-900`}>Booking Servis</Text>
            <Text style={tw`mt-2 text-xs text-slate-600`}>
              Pilih kendaraan, servis, dan jadwal yang tersedia.
            </Text>

            <View style={tw`mt-4`}>
              <Text style={tw`text-xs text-slate-500`}>Pilih Kendaraan</Text>
              {vehicles.length === 0 ? (
                <View style={tw`mt-2 flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3`}>
                  <Text style={tw`text-xs text-red-700 flex-1`}>Anda belum memiliki kendaraan di garasi.</Text>
                  <Pressable 
                    onPress={() => {
                      onClose();
                      router.push('/(tabs)/my-car');
                    }}
                    style={tw`ml-2 rounded-lg bg-red-600 px-3 py-1.5`}>
                    <Text style={tw`text-xs font-semibold text-white`}>Tambah</Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mt-2`}>
                  <View style={tw`flex-row`}> 
                    {vehicles.map((vehicle) => {
                      const isSelected = vehicle.id === selectedVehicleId;
                      return (
                        <Pressable
                          key={vehicle.id}
                          onPress={() => onSelectVehicle(vehicle.id)}
                          style={tw`mr-2 flex-row items-center rounded-xl border p-2 pl-3 pr-4 ${
                            isSelected
                              ? 'border-red-600 bg-red-50'
                              : 'border-slate-200 bg-white'
                          }`}>
                          <Ionicons 
                            name="car-sport" 
                            size={16} 
                            color={isSelected ? '#dc2626' : '#64748b'} 
                            style={tw`mr-2`}
                          />
                          <View>
                            <Text style={tw`text-xs font-medium ${isSelected ? 'text-red-700' : 'text-slate-700'}`}>
                              {vehicle.brand} {vehicle.model}
                            </Text>
                            <Text style={tw`text-[10px] ${isSelected ? 'text-red-500' : 'text-slate-500'}`}>
                              {vehicle.license_plate}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={tw`mt-4`}>
              <Text style={tw`text-xs text-slate-500`}>Pilih Servis</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mt-2`}>
                <View style={tw`flex-row`}> 
                  {services.map((service) => {
                    const isSelected = service.id === selectedServiceId;

                    return (
                      <Pressable
                        key={service.id}
                        onPress={() => onSelectService(service.id)}
                        style={tw`mr-2 rounded-full border px-4 py-2 ${
                          isSelected
                            ? 'border-red-600 bg-red-600'
                            : 'border-slate-200 bg-white'
                        }`}>
                        <Text style={tw`text-xs ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                          {service.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={tw`mt-3`}>
              <Text style={tw`text-xs text-slate-500`}>Pilih Tanggal</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pr-4`}
                style={tw`mt-2`}>
                <View style={tw`flex-row`}>
                  {dateOptions.map((option) => {
                    const isSelected =
                      option.date.toDateString() === selectedDate.toDateString();

                    return (
                      <Pressable
                        key={`${option.dayName}-${option.dateNumber}`}
                        onPress={() => onSelectDate(option.date)}
                        style={tw`mr-2 rounded-2xl border px-4 py-2 ${
                          isSelected
                            ? 'border-red-600 bg-red-600'
                            : 'border-gray-200 bg-white'
                        }`}>
                        <Text
                          style={tw`text-[10px] ${
                            isSelected ? 'text-white' : 'text-gray-700'
                          }`}>
                          {option.dayName}
                        </Text>
                        <Text
                          style={tw`mt-1 text-sm font-semibold ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}>
                          {option.dateNumber}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={tw`mt-3`}>
              <Text style={tw`text-xs text-slate-500`}>Pilih Slot</Text>
              {isSlotsLoading ? (
                <View style={tw`mt-2 flex-row flex-wrap gap-3`}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} className="h-9 w-16 rounded-xl" />
                  ))}
                </View>
              ) : (
                <View style={tw`mt-2 flex-row flex-wrap gap-3`}>
                  {slotOptions.length === 0 ? (
                    <Text style={tw`text-xs text-slate-500`}>Tidak ada slot tersedia</Text>
                  ) : null}
                  {slotOptions.map((slot) => {
                    const isSelected = slot.start === selectedSlot;
                    const isDisabled = !slot.available;

                    return (
                      <Pressable
                        key={slot.start}
                        onPress={() => onSelectSlot(slot.start)}
                        disabled={isDisabled}
                        style={tw`rounded-xl border px-3 py-2 ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-200'
                            : isSelected
                              ? 'border-red-600 bg-red-600'
                              : 'border-gray-200 bg-white'
                        }`}>
                        <Text
                          style={tw`text-center text-xs ${
                            isDisabled
                              ? 'text-gray-400'
                              : isSelected
                                ? 'text-white'
                                : 'text-gray-700'
                          }`}>
                          {slot.start}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {bookingError ? (
              <Text style={tw`mt-3 text-xs text-red-600`}>{bookingError}</Text>
            ) : null}

            <Pressable
              style={tw`mt-5 rounded-xl bg-red-600 px-4 py-3 ${
                isSubmitting || !selectedServiceId || !selectedSlot || !selectedVehicleId ? 'opacity-60' : ''
              }`}
              onPress={onConfirm}
              disabled={isSubmitting || !selectedServiceId || !selectedSlot || !selectedVehicleId}>
              <Text style={tw`text-center text-sm font-semibold text-white`}>
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
