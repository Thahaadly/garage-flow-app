import { router, Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import twrnc from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { apiPost, setAuthToken, getApiErrorMessage } from '@/src/lib/api';
import { saveToken } from '@/src/lib/token';

export default function RegisterScreen() {
  const tw = twrnc;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (isLoading) return;

    if (!name || !email || !password || !passwordConfirmation) {
      setError('Harap isi semua field wajib.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Password dan Konfirmasi Password tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiPost<{ data: { token: string } }>('/register', { 
        name, 
        email, 
        password,
        password_confirmation: passwordConfirmation 
      });
      const token = response.data.data.token;

      await saveToken(token);
      setAuthToken(token);
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registrasi gagal. Coba email lain.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient
        colors={['#740505', '#240000']}
        style={tw`flex-1 px-6 pt-16`}
      >
        <ScrollView contentContainerStyle={tw`pb-12`} showsVerticalScrollIndicator={false}>
          
          <View style={tw`items-center mb-8`}>
            <View style={tw`h-16 w-16 bg-white/10 rounded-2xl items-center justify-center mb-3 border border-white/20`}>
              <Ionicons name="car-sport" size={30} color="white" />
            </View>
            <Text style={tw`text-3xl font-bold text-white tracking-tight`}>Daftar Akun</Text>
            <Text style={tw`text-white/70 mt-1 text-center`}>
              Bergabung dan nikmati kemudahan servis kendaraan.
            </Text>
          </View>

          <View style={tw`rounded-3xl bg-white p-8 shadow-2xl`}>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>NAMA LENGKAP</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1`}>
                <Ionicons name="person-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  style={tw`flex-1 h-12 text-slate-900`}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>EMAIL</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1`}>
                <Ionicons name="mail-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  placeholder="contoh@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={tw`flex-1 h-12 text-slate-900`}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>PASSWORD</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1`}>
                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Minimal 8 karakter"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={tw`flex-1 h-12 text-slate-900`}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            <View style={tw`mb-2`}>
              <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>KONFIRMASI PASSWORD</Text>
              <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1`}>
                <Ionicons name="checkmark-done-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
                <TextInput
                  placeholder="Ulangi password"
                  secureTextEntry
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  style={tw`flex-1 h-12 text-slate-900`}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            {error ? (
              <View style={tw`bg-red-50 p-3 rounded-xl mt-4 flex-row items-center`}>
                <Ionicons name="alert-circle" size={16} color="#dc2626" style={tw`mr-2`} />
                <Text style={tw`text-xs text-red-600 flex-1`}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={tw`mt-8 rounded-2xl bg-[#740505] py-4 items-center shadow-md ${isLoading ? 'opacity-70' : ''}`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-bold text-base`}>Buat Akun</Text>
              )}
            </Pressable>

            <View style={tw`mt-8 flex-row justify-center items-center`}>
              <Text style={tw`text-sm text-slate-500`}>Sudah punya akun? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={tw`text-sm text-[#740505] font-bold`}>Masuk Sekarang</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
