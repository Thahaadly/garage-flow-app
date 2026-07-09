import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import twrnc from 'twrnc';
import { MaterialIcons } from '@expo/vector-icons';

import { CustomHeader } from '@/components/ui/CustomHeader';

export default function TradeInScreen() {
  const tw = twrnc;

  return (
    <View style={tw`flex-1 bg-white`}>
      <CustomHeader title="Trade In" />

      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`mb-6 rounded-2xl bg-[#740505] p-5 shadow-sm`}>
          <Text style={tw`text-lg font-bold text-white`}>Tukar Tambah Mudah</Text>
          <Text style={tw`mt-2 text-sm text-red-100`}>
            Dapatkan penawaran terbaik untuk mobil lama Anda dan bawa pulang mobil baru impian Anda hari ini.
          </Text>
        </View>

        <Text style={tw`mb-4 text-base font-bold text-slate-900`}>Data Mobil Lama Anda</Text>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Merek & Model</Text>
        <View style={tw`mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3`}>
          <TextInput placeholder="Misal: Toyota Avanza 1.5 G" style={tw`text-slate-900`} />
        </View>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Tahun Pembuatan</Text>
        <View style={tw`mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3`}>
          <TextInput placeholder="Misal: 2019" keyboardType="numeric" style={tw`text-slate-900`} />
        </View>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Estimasi Jarak Tempuh (KM)</Text>
        <View style={tw`mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3`}>
          <TextInput placeholder="Misal: 50000" keyboardType="numeric" style={tw`text-slate-900`} />
        </View>

        <Text style={tw`mb-4 text-base font-bold text-slate-900`}>Mobil Baru Incaran</Text>
        <View style={tw`mb-6 rounded-xl border border-slate-200 bg-white p-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-slate-600`}>Pilih mobil baru...</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
          </View>
        </View>

        <Pressable style={tw`rounded-xl bg-[#740505] py-4 shadow-sm`}>
          <Text style={tw`text-center text-base font-bold text-white`}>Cek Estimasi Harga</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
