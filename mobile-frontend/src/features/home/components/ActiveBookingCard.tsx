import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import twrnc from 'twrnc';

type ActiveBookingCardProps = {
  activeBookingLabel: string;
  activeBookingStatus: string;
  onPress: () => void;
};

export function ActiveBookingCard({
  activeBookingLabel,
  activeBookingStatus,
  onPress,
}: ActiveBookingCardProps) {
  const tw = twrnc;

  const isConfirmed = activeBookingStatus === 'confirmed';
  const isPending = activeBookingStatus === 'pending_payment';
  const isScheduled = activeBookingStatus === 'scheduled';

  const badgeColor = isConfirmed ? 'bg-green-100' : isScheduled ? 'bg-amber-100' : 'bg-red-50';
  const iconColor = isConfirmed ? '#16a34a' : isScheduled ? '#d97706' : '#dc2626';
  const statusColor = isConfirmed ? 'text-green-600' : isScheduled ? 'text-amber-700' : 'text-red-600';
  const statusText = isConfirmed ? 'LUNAS' : isScheduled ? 'Menunggu Inspeksi' : isPending ? 'Belum Dibayar' : activeBookingStatus;

  return (
    <Pressable
      onPress={onPress}
      style={tw`mt-2 rounded-2xl border ${isConfirmed ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
      <View style={tw`flex-row items-center`}> 
        <View style={tw`h-10 w-10 items-center justify-center rounded-full ${badgeColor}`}>
          <MaterialIcons name={isConfirmed ? "check-circle" : "calendar-month"} size={20} color={iconColor} />
        </View>
        <View style={tw`ml-3 flex-1`}>
          <Text style={tw`text-sm font-semibold text-slate-900`}>
            {isConfirmed ? 'Bukti Pembayaran' : 'Jadwal Servis Aktif'}
          </Text>
          <Text style={tw`mt-1 text-xs text-slate-600`}>
            {activeBookingLabel || 'Jadwal servis tersedia'}
          </Text>
        </View>
        {activeBookingStatus ? (
          <View style={tw`px-2 py-1 rounded-md ${badgeColor}`}>
            <Text style={tw`text-xs font-bold ${statusColor}`}>{statusText}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
