import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, Text, TextInput, RefreshControl, Platform } from 'react-native';
import twrnc from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

import { apiPost, apiDelete, getApiErrorMessage } from '@/src/lib/api';
import { showPlatformAlert } from '@/src/utils/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Constants from 'expo-constants';
import { useGlobalVehicles } from '@/src/context/VehicleContext';
import { CarVisualizer } from '@/src/features/home/components/CarVisualizer';
import { ColorPicker } from '@/src/components/ui/ColorPicker';

export default function MyCarScreen() {
  const tw = twrnc;
  const { vehicles, isLoading, error, loadVehicles, activeVehicleId, setActiveVehicleId, activeCarColor, setActiveCarColor } = useGlobalVehicles();
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    mileage: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  }, [loadVehicles]);

  const handleAdd = async () => {
    if (!addForm.brand || !addForm.model || !addForm.year || !addForm.license_plate || !addForm.mileage) {
      showPlatformAlert('Error', 'Harap isi semua field wajib.');
      return;
    }
    
    if (addForm.year.length !== 4 || isNaN(Number(addForm.year))) {
      showPlatformAlert('Error', 'Tahun harus berupa 4 digit angka.');
      return;
    }

    if (isNaN(Number(addForm.mileage))) {
      showPlatformAlert('Error', 'Odometer harus berupa angka.');
      return;
    }
    
    setIsSaving(true);
    try {
      await apiPost('/vehicles', {
        ...addForm,
        year: parseInt(addForm.year),
        mileage: parseInt(addForm.mileage),
      });
      setIsAdding(false);
      setAddForm({ brand: '', model: '', year: '', license_plate: '', mileage: '' });
      loadVehicles();
    } catch (err) {
      showPlatformAlert('Error', getApiErrorMessage(err, 'Gagal menambahkan kendaraan.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    showPlatformAlert('Konfirmasi', 'Hapus kendaraan ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await apiDelete(`/vehicles/${id}`);
          loadVehicles();
        } catch {
          showPlatformAlert('Error', 'Gagal menghapus kendaraan.');
        }
      }}
    ]);
  };

  return (
    <View style={tw`flex-1 bg-[#f8fafc]`}>
      {/* Header */}
      <View style={tw`bg-[#740505] px-6 pb-6 pt-12 rounded-b-3xl shadow-lg z-10 flex-row justify-between items-end`}>
        <View style={tw`flex-1`}>
          <Text style={tw`text-2xl font-bold text-white tracking-tight`}>Garasi Saya</Text>
          <Text style={tw`mt-1 text-sm text-white/80`}>
            Daftar kendaraan Anda yang terdaftar.
          </Text>
        </View>
        {!isAdding && (
          <Pressable 
            onPress={() => setIsAdding(true)}
            style={tw`bg-white/20 px-4 py-2 rounded-full flex-row items-center border border-white/30`}
          >
            <Ionicons name="add" size={16} color="white" style={tw`mr-1`} />
            <Text style={tw`text-white font-bold text-xs`}>Tambah</Text>
          </Pressable>
        )}
      </View>

      <ScrollView 
        style={tw`flex-1`} 
        contentContainerStyle={tw`p-6 pb-12`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#740505']} />
        }
      >
        {isAdding ? (
          <View style={tw`mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100`}>
            <View style={tw`flex-row justify-between items-center mb-6 border-b border-slate-100 pb-4`}>
              <Text style={tw`text-lg font-bold text-slate-800`}>Kendaraan Baru</Text>
              <Pressable onPress={() => setIsAdding(false)} style={tw`p-1`}>
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>MERK (BRAND)</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1`}>
                <Ionicons name="car-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  value={addForm.brand}
                  onChangeText={t => setAddForm(prev => ({...prev, brand: t}))}
                  placeholder="Contoh: Toyota"
                  style={tw`flex-1 h-12 text-slate-900`}
                />
              </View>
            </View>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>MODEL</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1`}>
                <Ionicons name="pricetag-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  value={addForm.model}
                  onChangeText={t => setAddForm(prev => ({...prev, model: t}))}
                  placeholder="Contoh: Innova Zenix"
                  style={tw`flex-1 h-12 text-slate-900`}
                />
              </View>
            </View>
            
            <View style={tw`mb-4 flex-row justify-between`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>TAHUN</Text>
                <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1`}>
                  <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={tw`mr-2`} />
                  <TextInput
                    value={addForm.year}
                    onChangeText={t => setAddForm(prev => ({...prev, year: t}))}
                    keyboardType="numeric"
                    placeholder="2022"
                    style={tw`flex-1 h-12 text-slate-900`}
                  />
                </View>
              </View>
              
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>PLAT NOMOR</Text>
                <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1`}>
                  <Ionicons name="barcode-outline" size={20} color="#94a3b8" style={tw`mr-2`} />
                  <TextInput
                    value={addForm.license_plate}
                    onChangeText={t => setAddForm(prev => ({...prev, license_plate: t}))}
                    placeholder="B 1234 ABC"
                    style={tw`flex-1 h-12 text-slate-900`}
                  />
                </View>
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>ODOMETER (KM) SAAT INI</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1`}>
                <Ionicons name="speedometer-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  value={addForm.mileage}
                  onChangeText={t => setAddForm(prev => ({...prev, mileage: t}))}
                  keyboardType="numeric"
                  placeholder="Contoh: 15000"
                  style={tw`flex-1 h-12 text-slate-900`}
                />
              </View>
            </View>

            <Pressable 
              onPress={handleAdd}
              disabled={isSaving}
              style={tw`mt-2 bg-[#740505] rounded-xl py-4 items-center shadow-md ${isSaving ? 'opacity-70' : ''}`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-bold text-sm`}>Simpan Kendaraan</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <View style={tw`mt-4`}>
            {[1, 2].map((item) => (
              <View key={item} style={tw`mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-100`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <View style={tw`flex-1`}>
                    <Skeleton className="h-5 w-1/2 rounded-md mb-2" />
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={tw`mt-10 items-center justify-center p-6 bg-red-50 rounded-2xl border border-red-100`}> 
            <Ionicons name="alert-circle" size={40} color="#dc2626" style={tw`mb-3`} />
            <Text style={tw`text-sm font-medium text-red-600 text-center`}>{error}</Text>
          </View>
        ) : (
          <View style={tw`mt-2`}>
            {!isAdding && vehicles.length === 0 ? (
              <View style={tw`mt-12 items-center justify-center`}>
                <View style={tw`h-24 w-24 bg-slate-100 rounded-full items-center justify-center mb-4`}>
                  <Ionicons name="car-outline" size={40} color="#94a3b8" />
                </View>
                <Text style={tw`text-lg font-bold text-slate-800`}>Garasi Kosong</Text>
                <Text style={tw`text-sm text-slate-500 mt-1 text-center px-4`}>
                  Tambahkan kendaraan pertama Anda agar bisa mulai memesan servis.
                </Text>
              </View>
            ) : (
              <>
                {/* 3D Visualizer for Active Vehicle */}
                {!isAdding && vehicles.length > 0 && (
                  <View style={tw`mb-6`}>
                    {(() => {
                      const currentVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
                      const modelName = currentVehicle.model.toLowerCase().replace(/ /g, '_');
                      let modelAsset: any = null;
                      if (currentVehicle.brand.toLowerCase() === 'toyota' && currentVehicle.model.toLowerCase().includes('fortuner')) {
                        modelAsset = Platform.OS === 'web' ? '/models/toyota_fortuner.glb' : require('../../assets/models/toyota_fortuner.glb');
                      } else if (currentVehicle.model.toLowerCase().includes('innova')) {
                        modelAsset = Platform.OS === 'web' ? '/models/innova_zenix_simple.glb' : require('../../assets/models/innova_zenix_simple.glb');
                      }
                      
                      return (
                        <View style={tw`items-center`}>
                          {modelAsset ? (
                            <CarVisualizer modelUrl={modelAsset} carColor={activeCarColor} />
                          ) : (
                            <View style={tw`h-64 w-full rounded-3xl bg-slate-100 items-center justify-center`}>
                              <Ionicons name="car-sport-outline" size={64} color="#94a3b8" />
                              <Text style={tw`text-slate-500 mt-2 text-sm`}>Model 3D tidak tersedia</Text>
                            </View>
                          )}
                          <ColorPicker selectedColor={activeCarColor} onSelectColor={setActiveCarColor} />
                          <Text style={tw`mt-4 text-center text-xl font-bold text-slate-900 uppercase`}>
                            {currentVehicle.brand} {currentVehicle.model}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* Vehicle List */}
                {vehicles.map(v => {
                  const isActive = v.id === activeVehicleId;
                const mileage = v.mileage ?? 0;
                const lastServiceMileage = v.last_service_mileage ?? mileage;
                const oilUsage = Math.max(0, mileage - lastServiceMileage);
                const oilLimit = 10000; // 10,000 KM
                const oilPercentage = Math.min(100, Math.round((oilUsage / oilLimit) * 100));
                
                let oilColor = 'bg-emerald-500';
                if (oilPercentage >= 90) {
                  oilColor = 'bg-red-500';
                } else if (oilPercentage >= 70) {
                  oilColor = 'bg-amber-500';
                }

                const batteryStatus = v.battery_health ?? 'Good';
                const batteryColor = batteryStatus === 'Good' ? 'text-emerald-600' : (batteryStatus === 'Fair' ? 'text-amber-500' : 'text-red-500');
                
                const tireCond = v.tire_condition ?? 100;
                const tireColor = tireCond > 70 ? 'text-emerald-600' : (tireCond > 30 ? 'text-amber-500' : 'text-red-500');

                return (
                  <Pressable 
                    key={v.id} 
                    onPress={() => setActiveVehicleId(v.id)}
                    style={tw`mb-5 rounded-3xl bg-white shadow-sm border ${isActive ? 'border-red-500' : 'border-slate-200'} overflow-hidden`}
                  >
                    <View style={tw`p-5 border-b border-slate-100 flex-row justify-between items-center`}>
                      <View style={tw`flex-row items-center flex-1`}>
                        <View style={tw`h-12 w-12 rounded-full ${isActive ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} border items-center justify-center mr-4`}>
                          <Ionicons name="car-sport" size={24} color={isActive ? "#dc2626" : "#64748b"} />
                        </View>
                        <View style={tw`flex-1 pr-4`}>
                          <Text style={tw`font-bold text-lg text-slate-900 mb-0.5`} numberOfLines={1}>{v.brand} {v.model}</Text>
                          <Text style={tw`text-slate-500 text-xs font-medium`}>{v.license_plate} • {v.year}</Text>
                        </View>
                      </View>
                      <Pressable 
                        onPress={() => handleDelete(v.id)}
                        style={tw`h-10 w-10 items-center justify-center rounded-full bg-red-50`}
                      >
                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                      </Pressable>
                    </View>

                    {/* Health Indicators Dashboard */}
                    <View style={tw`p-5 bg-slate-50`}>
                      <Text style={tw`text-xs font-bold text-slate-500 mb-3`}>KESEHATAN KENDARAAN</Text>
                      
                      {/* Odometer & Oil progress */}
                      <View style={tw`mb-4`}>
                        <View style={tw`flex-row justify-between items-end mb-1`}>
                          <View style={tw`flex-row items-center`}>
                            <Ionicons name="water" size={16} color="#64748b" style={tw`mr-1.5`} />
                            <Text style={tw`text-xs font-medium text-slate-700`}>Oli Mesin</Text>
                          </View>
                          <Text style={tw`text-xs font-bold text-slate-900`}>{oilUsage.toLocaleString('id-ID')} / 10.000 KM</Text>
                        </View>
                        <View style={tw`h-2 bg-slate-200 rounded-full overflow-hidden`}>
                          <View style={[tw`h-full ${oilColor}`, { width: `${oilPercentage}%` }]} />
                        </View>
                        {oilPercentage >= 90 && (
                          <Text style={tw`text-[10px] text-red-600 mt-1`}>Disarankan segera ganti oli.</Text>
                        )}
                      </View>

                      {/* Horizontal Indicators */}
                      <View style={tw`flex-row justify-between mt-2`}>
                        <View style={tw`flex-1 bg-white p-3 rounded-2xl mr-2 shadow-sm border border-slate-100 items-center`}>
                          <Ionicons name="speedometer" size={24} color="#64748b" style={tw`mb-1`} />
                          <Text style={tw`text-[10px] text-slate-500 font-medium`}>Odometer</Text>
                          <Text style={tw`text-xs font-bold text-slate-800 mt-0.5`}>{mileage.toLocaleString('id-ID')} KM</Text>
                        </View>
                        <View style={tw`flex-1 bg-white p-3 rounded-2xl mx-1 shadow-sm border border-slate-100 items-center`}>
                          <Ionicons name="battery-charging" size={24} style={tw`${batteryColor} mb-1`} />
                          <Text style={tw`text-[10px] text-slate-500 font-medium`}>Aki (Battery)</Text>
                          <Text style={tw`text-xs font-bold text-slate-800 mt-0.5`}>{batteryStatus}</Text>
                        </View>
                        <View style={tw`flex-1 bg-white p-3 rounded-2xl ml-2 shadow-sm border border-slate-100 items-center`}>
                          <Ionicons name="disc" size={24} style={tw`${tireColor} mb-1`} />
                          <Text style={tw`text-[10px] text-slate-500 font-medium`}>Kondisi Ban</Text>
                          <Text style={tw`text-xs font-bold text-slate-800 mt-0.5`}>{tireCond}%</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
