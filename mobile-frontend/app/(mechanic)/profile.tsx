import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import twrnc from 'twrnc';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/src/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { deleteToken } from '@/src/lib/token';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const tw = twrnc;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiGet<any>('/profile');
      setUser(res);
    } catch (e: any) {
      console.warn('fetchProfile error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost('/logout', {});
    } catch {}
    await deleteToken();
    router.replace('/login');
  };

  if (loading) return <ActivityIndicator style={tw`flex-1`} />;

  return (
    <ScrollView style={tw`flex-1 bg-slate-50`} contentContainerStyle={tw`p-6 pb-32 pt-20`}>
      <Text style={tw`text-3xl font-bold text-slate-900 mb-8`}>Profil Mekanik</Text>

      <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 items-center`}>
        <View style={tw`w-24 h-24 rounded-full bg-slate-200 items-center justify-center mb-4`}>
          <Ionicons name="person" size={40} color="#94a3b8" />
        </View>
        <Text style={tw`text-xl font-bold text-slate-800`}>{user?.name}</Text>
        <Text style={tw`text-slate-500 mt-1`}>{user?.email}</Text>
        <View style={tw`bg-amber-100 px-3 py-1 rounded-full mt-3`}>
          <Text style={tw`text-amber-800 font-bold text-xs`}>{user?.role || 'Mekanik'}</Text>
        </View>
      </View>

      <Pressable onPress={handleLogout} style={tw`bg-white flex-row items-center justify-center p-4 rounded-2xl border border-red-200 mt-4`}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" style={tw`mr-2`} />
        <Text style={tw`text-red-500 font-bold`}>Keluar Akun</Text>
      </Pressable>
    </ScrollView>
  );
}
