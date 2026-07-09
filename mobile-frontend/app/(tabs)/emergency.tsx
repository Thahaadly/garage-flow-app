import { ScrollView, Text, View, Pressable, Linking } from 'react-native';
import twrnc from 'twrnc';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { CustomHeader } from '@/components/ui/CustomHeader';

export default function EmergencyScreen() {
  const tw = twrnc;

  return (
    <View style={tw`flex-1 bg-white`}>
      <CustomHeader title="Emergency Roadside" />

      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`mb-6 items-center rounded-2xl bg-red-50 p-6 border border-red-100`}>
          <View style={tw`mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100`}>
            <MaterialIcons name="warning" size={32} color="#dc2626" />
          </View>
          <Text style={tw`text-center text-lg font-bold text-slate-900`}>
            Butuh Bantuan Darurat?
          </Text>
          <Text style={tw`mt-2 text-center text-sm text-slate-600`}>
            Layanan darurat 24 jam kami siap membantu Anda di jalan. 
            Tekan tombol di bawah untuk langsung terhubung dengan operator.
          </Text>
        </View>

        <Pressable 
          onPress={() => Linking.openURL('tel:1500898')}
          style={tw`mb-4 flex-row items-center justify-center rounded-xl bg-[#740505] py-4 shadow-sm`}>
          <MaterialIcons name="phone" size={24} color="white" style={tw`mr-2`} />
          <Text style={tw`text-base font-bold text-white`}>Hubungi 1500-898</Text>
        </Pressable>

        <Text style={tw`mt-4 mb-4 text-base font-bold text-slate-900`}>Layanan Tersedia</Text>

        <View style={tw`flex-row flex-wrap justify-between`}>
          {[
            { icon: 'car-battery', label: 'Jumper Aki', type: 'fa' },
            { icon: 'tire-repair', label: 'Ganti Ban', type: 'md' },
            { icon: 'gas-station', label: 'Kehabisan BBM', type: 'fa' },
            { icon: 'truck-pickup', label: 'Towing Service', type: 'fa' },
          ].map((item, idx) => (
            <View key={idx} style={tw`mb-4 w-[48%] items-center rounded-xl border border-slate-200 p-4`}>
              {item.type === 'fa' ? (
                <FontAwesome5 name={item.icon} size={28} color="#64748b" />
              ) : (
                <MaterialIcons name={item.icon as never} size={32} color="#64748b" />
              )}
              <Text style={tw`mt-3 text-center text-sm font-medium text-slate-700`}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
