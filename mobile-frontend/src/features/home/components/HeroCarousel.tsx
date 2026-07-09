import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import twrnc from 'twrnc';

import { Vehicle } from '@/src/types';
import { CarVisualizer } from './CarVisualizer';
import { ColorPicker } from '@/src/components/ui/ColorPicker';
import { useGlobalVehicles } from '@/src/context/VehicleContext';

type HeroCarouselProps = {
  vehicles: Vehicle[];
  activeVehicleId: number | null;
  onHeroImagePress: () => void;
  onAddVehiclePress: () => void;
};

export function HeroCarousel({
  vehicles,
  activeVehicleId,
  onHeroImagePress,
  onAddVehiclePress,
}: HeroCarouselProps) {
  const tw = twrnc;
  const { activeCarColor, setActiveCarColor } = useGlobalVehicles();

  if (!vehicles || vehicles.length === 0) {
    return (
      <View style={tw`mt-4 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8`}>
        <Ionicons name="car-sport-outline" size={48} color="#94a3b8" />
        <Text style={tw`mt-4 text-center text-base font-medium text-slate-900`}>
          Belum Ada Kendaraan
        </Text>
        <Text style={tw`mt-2 text-center text-xs text-slate-500`}>
          Tambahkan kendaraan ke garasi Anda untuk melihat estimasi dan kemudahan servis.
        </Text>
        <Pressable
          onPress={onAddVehiclePress}
          style={tw`mt-4 rounded-xl bg-slate-900 px-6 py-2`}
        >
          <Text style={tw`text-sm font-semibold text-white`}>Buka Garasi Saya</Text>
        </Pressable>
      </View>
    );
  }

  const currentIndex = vehicles.findIndex(v => v.id === activeVehicleId);
  const displayIndex = currentIndex !== -1 ? currentIndex : 0;
  const currentVehicle = vehicles[displayIndex];
  
  // Format model folder name, e.g. "Innova Zenix" -> "innova_zenix", "Toyota Fortuner 2021" -> "toyota_fortuner_2021"
  // Assuming the user types "innova zenix" or "toyota fortuner 2021" in the brand/model fields
  // Here we just use the model field and convert it to lowercase and replace spaces with underscores.
  // Actually, we can combine brand and model if needed, but the user named the folders "innova_zenix" and "toyota_fortuner_2021".
  // Let's create a combined string and format it.
  const modelName = currentVehicle.model.toLowerCase().replace(/ /g, '_');
  let folderName = modelName;
  if (currentVehicle.brand.toLowerCase() === 'toyota' && currentVehicle.model.toLowerCase().includes('fortuner')) {
    folderName = 'toyota_fortuner_2021'; // Hardcoded fallback based on what user uploaded
  } else if (currentVehicle.model.toLowerCase().includes('innova')) {
    folderName = 'innova_zenix';
  }

  // Assuming backend is running locally on the same IP as Expo. 
  // EXPO_PUBLIC_API_URL usually has /api, so we replace /api with /models
  const backendUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://192.168.1.100:8000';
  const gltfUrl = `${backendUrl}/model-files/${folderName}/scene.gltf`;

  const fallbackImageUrl = currentVehicle.image_url || 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80';

  const FallbackImage = (
    <Pressable onPress={vehicles.length > 1 ? onHeroImagePress : undefined}>
      <Image
        source={{ uri: fallbackImageUrl }}
        style={tw`h-52 w-full rounded-3xl`}
      />
    </Pressable>
  );

  return (
    <View style={tw`mt-4`}>
      <CarVisualizer modelUrl={gltfUrl} fallbackImage={FallbackImage} carColor={activeCarColor} />
      <ColorPicker selectedColor={activeCarColor} onSelectColor={setActiveCarColor} />
      
      {vehicles.length > 1 && (
        <Text style={tw`mt-4 text-center text-xs text-slate-500`}>
          Tap gambar untuk melihat kendaraan lain ({displayIndex + 1}/{vehicles.length})
        </Text>
      )}
      
      <Text style={tw`mt-3 text-center text-xl font-bold text-slate-900 uppercase`}>
        {currentVehicle.brand} {currentVehicle.model}
      </Text>
      
      <View style={tw`mt-2 flex-row items-center justify-center gap-2`}>
        {currentVehicle.year && (
          <View style={tw`rounded-full border border-slate-300 px-3 py-1`}>
            <Text style={tw`text-[10px] text-slate-700`}>{currentVehicle.year}</Text>
          </View>
        )}
        <View style={tw`rounded-full border border-slate-300 bg-slate-900 px-3 py-1`}>
          <Text style={tw`text-[10px] text-white font-bold`}>{currentVehicle.license_plate}</Text>
        </View>
      </View>
      
      <View style={tw`mt-4 w-full rounded-3xl border border-gray-100 bg-white/80 p-4 shadow-sm`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`items-center`}> 
            <Text style={tw`text-[10px] text-slate-500`}>KONDISI AKI</Text>
            <Text style={tw`mt-1 text-sm font-semibold ${currentVehicle.battery_health === 'Good' ? 'text-green-600' : 'text-slate-900'}`}>
              {currentVehicle.battery_health || '-'}
            </Text>
          </View>
          <View style={tw`h-8 w-px bg-slate-200`} />
          <View style={tw`items-center`}> 
            <Text style={tw`text-[10px] text-slate-500`}>ODOMETER</Text>
            <Text style={tw`mt-1 text-sm font-semibold text-slate-900`}>{currentVehicle.mileage || 0} km</Text>
          </View>
          <View style={tw`h-8 w-px bg-slate-200`} />
          <View style={tw`items-center`}> 
            <Text style={tw`text-[10px] text-slate-500`}>KONDISI BAN</Text>
            <Text style={tw`mt-1 text-sm font-semibold text-slate-900`}>{currentVehicle.tire_condition || '-'}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
