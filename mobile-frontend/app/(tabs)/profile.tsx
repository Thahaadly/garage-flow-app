import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View, Text, Pressable } from 'react-native';
import twrnc from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Input } from '@/components/ui/input';
import { apiGetRaw, apiPut, getApiErrorMessage } from '@/src/lib/api';
import { logout } from '@/src/features/auth/authService';
import { showPlatformAlert } from '@/src/utils/alert';

type ProfileData = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
};

type ProfileResponse = {
  data: ProfileData;
};

export default function ProfileScreen() {
  const tw = twrnc;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiGetRaw<ProfileResponse | ProfileData>('/profile');
        const data = 'data' in response ? response.data : response;

        if (isMounted) {
          setProfile(data);
          setEditForm({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch {
        if (isMounted) {
          setError('Gagal memuat profil.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      showPlatformAlert('Error', 'Nama lengkap wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await apiPut('/profile', editForm);
      if (profile) {
        setProfile({
          ...profile,
          ...editForm,
        });
      }
      setIsEditing(false);
      showPlatformAlert('Sukses', 'Profil berhasil diperbarui!');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Gagal memperbarui profil.'));
      showPlatformAlert('Error', getApiErrorMessage(e, 'Gagal memperbarui profil.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    showPlatformAlert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={tw`flex-row items-center py-4 border-b border-slate-100`}>
      <View style={tw`h-10 w-10 rounded-full bg-slate-50 items-center justify-center mr-4`}>
        <Ionicons name={icon} size={20} color="#64748b" />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5`}>{label}</Text>
        <Text style={tw`text-sm font-semibold text-slate-800`}>{value || '-'}</Text>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-[#f8fafc]`}>
      <ScrollView contentContainerStyle={tw`pb-12`} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <LinearGradient
          colors={['#740505', '#4a0404']}
          style={tw`pt-16 pb-8 px-6 rounded-b-[40px] shadow-md items-center relative z-10`}
        >
          <View style={tw`h-24 w-24 rounded-full bg-white/20 items-center justify-center mb-4 border-2 border-white/30`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-4xl font-bold text-white`}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
          </View>
          
          <Text style={tw`text-xl font-bold text-white mb-1`}>
            {isLoading ? 'Memuat...' : profile?.name || 'User'}
          </Text>
          <View style={tw`flex-row items-center bg-black/20 px-3 py-1 rounded-full`}>
            <Ionicons name="mail" size={12} color="white" style={tw`mr-1.5`} />
            <Text style={tw`text-xs text-white/90`}>
              {isLoading ? '...' : profile?.email || 'email@example.com'}
            </Text>
          </View>
        </LinearGradient>

        <View style={tw`px-6 -mt-4 z-20`}>
          {!isLoading && error ? (
            <View style={tw`bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 flex-row items-center`}>
              <Ionicons name="alert-circle" size={24} color="#dc2626" style={tw`mr-3`} />
              <Text style={tw`text-sm text-red-700 flex-1`}>{error}</Text>
            </View>
          ) : null}

          {/* Card Content */}
          <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100`}>
            
            {/* Header / Edit Toggle */}
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-lg font-bold text-slate-800`}>Informasi Personal</Text>
              {!isLoading && profile && (
                <Pressable onPress={() => setIsEditing(!isEditing)} style={tw`p-2 -mr-2`}>
                  <Ionicons name={isEditing ? "close" : "pencil"} size={20} color="#740505" />
                </Pressable>
              )}
            </View>

            {isLoading ? (
              <View style={tw`py-10 items-center`}>
                <ActivityIndicator size="large" color="#740505" />
                <Text style={tw`mt-4 text-slate-500 text-sm`}>Mengambil data profil...</Text>
              </View>
            ) : profile ? (
              isEditing ? (
                <View style={tw`mt-2`}>
                  <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>NAMA LENGKAP</Text>
                  <Input
                    value={editForm.name}
                    onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
                    style={tw`mb-4 bg-slate-50 border-slate-200 rounded-xl`}
                  />
                  
                  <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>NOMOR TELEPON</Text>
                  <Input
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm((prev) => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                    style={tw`mb-4 bg-slate-50 border-slate-200 rounded-xl`}
                  />

                  <Text style={tw`text-xs font-bold text-slate-500 mb-1 ml-1`}>ALAMAT LENGKAP</Text>
                  <Input
                    value={editForm.address}
                    onChangeText={(text) => setEditForm((prev) => ({ ...prev, address: text }))}
                    style={tw`mb-6 bg-slate-50 border-slate-200 rounded-xl`}
                  />

                  <Pressable 
                    onPress={handleSave}
                    disabled={isSaving}
                    style={tw`bg-[#740505] rounded-2xl py-4 items-center shadow-md ${isSaving ? 'opacity-70' : ''}`}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={tw`text-white font-bold text-base`}>Simpan Perubahan</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <View>
                  <InfoRow icon="person-outline" label="Nama Lengkap" value={profile.name} />
                  <InfoRow icon="call-outline" label="Nomor Telepon" value={profile.phone || ''} />
                  <InfoRow icon="location-outline" label="Alamat" value={profile.address || ''} />
                  {profile.role && profile.role !== 'Pelanggan' && (
                    <InfoRow icon="shield-checkmark-outline" label="Role Sistem" value={profile.role} />
                  )}
                </View>
              )
            ) : null}
          </View>

          {/* Logout Button */}
          {!isLoading && profile && !isEditing && (
            <Pressable 
              onPress={handleLogout}
              style={tw`mt-6 bg-red-50 border border-red-100 rounded-2xl py-4 flex-row items-center justify-center`}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" style={tw`mr-2`} />
              <Text style={tw`text-red-600 font-bold text-base`}>Keluar Akun</Text>
            </Pressable>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
