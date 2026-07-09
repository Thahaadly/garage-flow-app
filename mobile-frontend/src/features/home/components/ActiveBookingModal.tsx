import { Modal, Pressable, Text, View } from 'react-native';
import twrnc from 'twrnc';

type ActiveBookingDetails = {
  id: number;
  serviceName: string;
  scheduledAt: string;
  status: string;
  total_price?: number;
  items?: any[];
};

type ActiveBookingModalProps = {
  visible: boolean;
  onClose: () => void;
  details: ActiveBookingDetails | null;
  formatScheduleDisplay: (scheduledAt: string) => string;
  onContinuePayment?: () => void;
};

export function ActiveBookingModal({
  visible,
  onClose,
  details,
  formatScheduleDisplay,
  onContinuePayment,
}: ActiveBookingModalProps) {
  const tw = twrnc;

  const isConfirmed = details?.status === 'confirmed';
  const isPending = details?.status === 'pending_payment';
  
  const statusColor = isConfirmed ? 'text-green-600' : 'text-red-600';
  const statusText = isConfirmed ? 'LUNAS' : isPending ? 'Menunggu Pembayaran' : details?.status;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={tw`flex-1 items-center justify-center bg-black/40 px-6`}>
        <View style={tw`w-full rounded-2xl bg-white p-6 shadow-xl border-t-8 ${isConfirmed ? 'border-t-green-500' : 'border-t-red-600'}`}>
          <Text style={tw`text-xl font-bold text-slate-900 text-center`}>
            {isConfirmed ? 'e-Receipt' : 'Detail Pesanan'}
          </Text>
          <Text style={tw`mt-1 text-xs text-slate-500 text-center mb-4`}>
            {isConfirmed ? 'Terima kasih telah melakukan pembayaran.' : 'Selesaikan pembayaran untuk mengamankan jadwal.'}
          </Text>

          {/* Dotted separator line */}
          <View style={tw`w-full h-[1px] border border-dashed border-slate-300 mb-4`} />

          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-sm text-slate-500`}>Layanan</Text>
            <Text style={tw`text-sm font-semibold text-slate-900`}>{details?.serviceName ?? '-'}</Text>
          </View>

          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-sm text-slate-500`}>Jadwal</Text>
            <Text style={tw`text-sm font-semibold text-slate-900`}>{formatScheduleDisplay(details?.scheduledAt ?? '')}</Text>
          </View>

          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-sm text-slate-500`}>Status</Text>
            <View style={tw`px-3 py-1 rounded-full ${isConfirmed ? 'bg-green-100' : 'bg-red-50'}`}>
              <Text style={tw`text-sm font-bold ${statusColor}`}>{statusText}</Text>
            </View>
          </View>

          {/* Dotted separator line */}
          <View style={tw`w-full h-[1px] border border-dashed border-slate-300 mb-5`} />

          {details?.items && details.items.length > 0 && (
            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-bold text-slate-800 mb-2`}>Rincian Tagihan</Text>
              {details.items.map((item: any, idx: number) => (
                <View key={idx} style={tw`flex-row justify-between mb-1.5`}>
                  <Text style={tw`text-xs text-slate-600 flex-1`}>{item.item_name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</Text>
                  <Text style={tw`text-xs font-semibold text-slate-800`}>Rp {Number(item.subtotal).toLocaleString('id-ID')}</Text>
                </View>
              ))}
              <View style={tw`w-full h-[1px] bg-slate-200 my-2`} />
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-sm font-bold text-slate-900`}>Total Harga</Text>
                <Text style={tw`text-sm font-bold text-[#740505]`}>Rp {Number(details.total_price).toLocaleString('id-ID')}</Text>
              </View>
            </View>
          )}

          {isPending ? (
            <>
              <Pressable
                style={tw`w-full rounded-xl bg-red-600 px-4 py-3 mb-2`}
                onPress={onContinuePayment}>
                <Text style={tw`text-center text-sm font-bold text-white`}>
                  Lanjutkan Pembayaran
                </Text>
              </Pressable>
              <Pressable
                style={tw`w-full rounded-xl bg-white border border-slate-200 px-4 py-3`}
                onPress={onClose}>
                <Text style={tw`text-center text-sm font-bold text-slate-700`}>
                  Tutup
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={tw`w-full rounded-xl ${isConfirmed ? 'bg-green-600' : 'bg-red-600'} px-4 py-3`}
              onPress={onClose}>
              <Text style={tw`text-center text-sm font-bold text-white`}>
                {isConfirmed ? 'Tutup & Selesai' : 'Tutup'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
