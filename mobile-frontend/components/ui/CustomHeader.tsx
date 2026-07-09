import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import twrnc from 'twrnc';

type CustomHeaderProps = {
  title: string;
};

export function CustomHeader({ title }: CustomHeaderProps) {
  const tw = twrnc;
  return (
    <View style={tw`flex-row items-center border-b border-slate-200 bg-white px-5 pb-4 pt-12`}>
      <Pressable onPress={() => router.back()} style={tw`mr-4`}>
        <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
      </Pressable>
      <Text style={tw`text-lg font-bold text-slate-900`}>{title}</Text>
    </View>
  );
}
