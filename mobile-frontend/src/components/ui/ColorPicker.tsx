import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import twrnc from 'twrnc';

export const CAR_COLORS = [
  { id: 'white', hex: '#ffffff', name: 'Putih' },
  { id: 'silver', hex: '#94a3b8', name: 'Silver' },
  { id: 'black', hex: '#1e293b', name: 'Hitam' },
  { id: 'red', hex: '#dc2626', name: 'Merah' },
  { id: 'blue', hex: '#2563eb', name: 'Biru' },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const tw = twrnc;

  return (
    <View style={tw`w-full items-center mt-4`}>
      <Text style={tw`text-xs font-bold text-slate-500 mb-2`}>PILIH WARNA</Text>
      <View style={tw`flex-row justify-center items-center bg-white rounded-full p-2 shadow-sm border border-slate-100`}>
        {CAR_COLORS.map((c) => {
          const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelectColor(c.hex)}
              style={tw`mx-1 w-8 h-8 rounded-full items-center justify-center border-2 ${
                isSelected ? 'border-red-600 scale-110' : 'border-transparent'
              }`}
            >
              <View 
                style={[
                  tw`w-6 h-6 rounded-full border border-slate-200`, 
                  { backgroundColor: c.hex }
                ]} 
              >
                {isSelected && c.hex === '#ffffff' && (
                  <Ionicons name="checkmark" size={14} color="#000" style={tw`absolute self-center top-1`} />
                )}
                {isSelected && c.hex !== '#ffffff' && (
                  <Ionicons name="checkmark" size={14} color="#fff" style={tw`absolute self-center top-1`} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
