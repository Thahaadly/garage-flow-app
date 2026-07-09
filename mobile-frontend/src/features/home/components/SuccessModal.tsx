import { Modal, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import twrnc from 'twrnc';

type SuccessModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
  const tw = twrnc;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={tw`flex-1 items-center justify-center bg-black/40 px-6`}>
        <View style={tw`w-full rounded-2xl bg-white p-6`}> 
          <View style={tw`items-center`}>
            <View style={tw`h-12 w-12 items-center justify-center rounded-full bg-green-50`}>
              <MaterialIcons name="check-circle" size={28} color="#16a34a" />
            </View>
            <Text style={tw`mt-3 text-base font-semibold text-slate-900`}>
              Booking Berhasil
            </Text>
            <Text style={tw`mt-2 text-center text-xs text-slate-600`}>
              Jadwal servis kamu sudah tercatat.
            </Text>
          </View>
          <Pressable
            style={tw`mt-5 rounded-xl bg-red-600 px-4 py-3`}
            onPress={onClose}>
            <Text style={tw`text-center text-sm font-semibold text-white`}>Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
