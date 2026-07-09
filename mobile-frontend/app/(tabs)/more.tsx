import { ScrollView, Text, View, Pressable } from 'react-native';
import twrnc from 'twrnc';
import { MaterialIcons } from '@expo/vector-icons';

import { CustomHeader } from '@/components/ui/CustomHeader';

export default function MoreScreen() {
  const tw = twrnc;

  const menus = [
    { title: 'Bantuan & FAQ', icon: 'help-outline' },
    { title: 'Promo & Penawaran', icon: 'local-offer' },
    { title: 'Lokasi Cabang', icon: 'location-on' },
    { title: 'Berita & Artikel', icon: 'article' },
    { title: 'Kalkulator Simulasi Kredit', icon: 'calculate' },
  ];

  return (
    <View style={tw`flex-1 bg-white`}>
      <CustomHeader title="Menu Lainnya" />

      <ScrollView contentContainerStyle={tw`p-5`}>
        <View style={tw`rounded-2xl border border-slate-200 bg-white overflow-hidden`}>
          {menus.map((menu, index) => (
            <Pressable 
              key={index} 
              style={tw`flex-row items-center justify-between border-b border-slate-100 p-4 ${index === menus.length - 1 ? 'border-b-0' : ''}`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={tw`mr-4 h-10 w-10 items-center justify-center rounded-full bg-slate-50`}>
                  <MaterialIcons name={menu.icon as never} size={20} color="#64748b" />
                </View>
                <Text style={tw`text-base font-medium text-slate-700`}>{menu.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
