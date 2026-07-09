import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import twrnc from 'twrnc';

type MenuItem = {
  label: string;
  icon: string;
  action: string;
};

type QuickActionMenuProps = {
  menuItems: MenuItem[];
  onMenuAction: (action: string) => void;
};

export function QuickActionMenu({
  menuItems,
  onMenuAction,
}: QuickActionMenuProps) {
  const tw = twrnc;

  return (
    <View style={tw`mt-6`}>
      <View style={tw`flex-row flex-wrap justify-between`}>
        {menuItems.map((item) => (
          <View key={item.label} style={tw`mb-4 w-[23%]`}>
            <Pressable onPress={() => onMenuAction(item.action)} style={tw`items-center`}>
              <View style={tw`h-12 w-12 items-center justify-center rounded-full bg-[#740505]`}>
                <MaterialIcons name={item.icon as never} size={22} color="#ffffff" />
              </View>
              <Text style={tw`mt-1 text-center text-xs text-slate-700`}>
                {item.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
