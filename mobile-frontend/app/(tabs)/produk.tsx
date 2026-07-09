import { ScrollView, Text, View, Pressable, Image } from 'react-native';
import twrnc from 'twrnc';

import { CustomHeader } from '@/components/ui/CustomHeader';

export default function ProdukScreen() {
  const tw = twrnc;

  const cars = [
    {
      id: 1,
      name: 'All New Kijang Innova Zenix',
      price: 'Mulai Rp 430.400.000',
      image: 'https://imgcdn.oto.com/large/gallery/exterior/38/2017/toyota-venturer-front-angle-low-view-755891.jpg',
      type: 'Hybrid EV',
    },
    {
      id: 2,
      name: 'All New Yaris Cross',
      price: 'Mulai Rp 351.000.000',
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
      type: 'Hybrid EV',
    },
    {
      id: 3,
      name: 'New Fortuner',
      price: 'Mulai Rp 573.700.000',
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80',
      type: 'SUV',
    },
  ];

  return (
    <View style={tw`flex-1 bg-white`}>
      <CustomHeader title="Katalog Produk" />

      <ScrollView contentContainerStyle={tw`p-5`}>
        <Text style={tw`mb-4 text-sm text-slate-600`}>
          Temukan mobil impian Anda dengan penawaran terbaik dari GarageFlow.
        </Text>

        {cars.map((car) => (
          <View key={car.id} style={tw`mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}>
            <Image source={{ uri: car.image }} style={tw`h-48 w-full bg-slate-200`} />
            <View style={tw`p-4`}>
              <View style={tw`mb-2 self-start rounded-full bg-red-100 px-3 py-1`}>
                <Text style={tw`text-xs font-medium text-red-700`}>{car.type}</Text>
              </View>
              <Text style={tw`text-lg font-bold text-slate-900`}>{car.name}</Text>
              <Text style={tw`mt-1 text-sm text-slate-500`}>{car.price}</Text>
              
              <Pressable style={tw`mt-4 rounded-xl bg-[#740505] py-3`}>
                <Text style={tw`text-center font-semibold text-white`}>Minta Penawaran</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
