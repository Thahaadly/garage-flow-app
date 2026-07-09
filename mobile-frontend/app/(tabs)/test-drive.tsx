import { ScrollView, Text, View, Pressable } from 'react-native';
import twrnc from 'twrnc';
import { MaterialIcons } from '@expo/vector-icons';

import { CustomHeader } from '@/components/ui/CustomHeader';

export default function TestDriveScreen() {
  const tw = twrnc;

  return (
    <View style={tw`flex-1 bg-white`}>
      <CustomHeader title="Test Drive" />

      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`mb-6 items-center rounded-2xl bg-slate-50 p-6`}>
          <MaterialIcons name="directions-car" size={48} color="#740505" />
          <Text style={tw`mt-3 text-center text-base font-bold text-slate-900`}>
            Rasakan Pengalaman Berkendara
          </Text>
          <Text style={tw`mt-1 text-center text-sm text-slate-600`}>
            Jadwalkan test drive untuk mobil impian Anda di dealer terdekat.
          </Text>
        </View>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Pilih Mobil</Text>
        <View style={tw`mb-4 rounded-xl border border-slate-200 bg-white p-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-slate-600`}>Pilih model kendaraan...</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
          </View>
        </View>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Tanggal Test Drive</Text>
        <View style={tw`mb-4 flex-row items-center rounded-xl border border-slate-200 bg-white p-4`}>
          <MaterialIcons name="calendar-today" size={20} color="#94a3b8" style={tw`mr-3`} />
          <Text style={tw`text-slate-600`}>Pilih tanggal...</Text>
        </View>

        <Text style={tw`mb-2 text-sm font-medium text-slate-700`}>Lokasi Dealer</Text>
        <View style={tw`mb-6 rounded-xl border border-slate-200 bg-white p-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-slate-600`}>Pilih dealer terdekat...</Text>
            <MaterialIcons name="location-on" size={24} color="#94a3b8" />
          </View>
        </View>

        <Pressable style={tw`rounded-xl bg-[#740505] py-4 shadow-sm`}>
          <Text style={tw`text-center text-base font-bold text-white`}>Jadwalkan Sekarang</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
