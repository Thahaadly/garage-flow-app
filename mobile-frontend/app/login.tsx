import { router, Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View, Text, ActivityIndicator } from 'react-native';
import twrnc from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { apiPost, setAuthToken } from '@/src/lib/api';
import { saveToken, saveRole } from '@/src/lib/token';

export default function LoginScreen() {
  const tw = twrnc;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiPost<{ data: { token: string; user: { role: string } } }>('/login', { email, password });
      const token = response.data.data.token;
      const role = response.data.data.user.role;

      await saveToken(token);
      await saveRole(role);
      setAuthToken(token);
      
      if (role === 'Mekanik' || role === 'Admin') {
          router.replace('/(mechanic)');
      } else {
          router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('Login Error:', err?.message || err);
      if (err?.message === 'Network Error') {
        setError('Gagal koneksi ke server. Pastikan backend menyala dan IP benar.');
      } else {
        setError('Email atau password salah.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient
        colors={['#740505', '#240000']}
        style={tw`flex-1 justify-center px-6`}
      >
        <View style={tw`items-center mb-8`}>
          <View style={tw`h-20 w-20 bg-white/10 rounded-3xl items-center justify-center mb-4 border border-white/20`}>
            <Ionicons name="car-sport" size={40} color="white" />
          </View>
          <Text style={tw`text-4xl font-bold text-white tracking-tight`}>GarageFlow</Text>
          <Text style={tw`text-white/70 mt-2 text-center`}>
            Manajemen Bengkel Modern & Cerdas
          </Text>
        </View>

        <View style={tw`rounded-3xl bg-white p-8 shadow-2xl`}>
          <Text style={tw`text-2xl font-bold text-slate-900 mb-1`}>Selamat Datang</Text>
          <Text style={tw`text-sm text-slate-500 mb-6`}>
            Silakan masuk untuk melanjutkan.
          </Text>

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

          <View style={tw`mb-2`}>
            <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>PASSWORD</Text>
            <View style={tw`flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1`}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={tw`mr-3`} />
              <TextInput
                placeholder="********"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
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
            onPress={handleLogin}
            disabled={isLoading}
            style={tw`mt-8 rounded-2xl bg-[#740505] py-4 items-center shadow-md ${isLoading ? 'opacity-70' : ''}`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-base`}>Masuk</Text>
            )}
          </Pressable>

          <View style={tw`mt-8 flex-row justify-center items-center`}>
            <Text style={tw`text-sm text-slate-500`}>Belum punya akun? </Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text style={tw`text-sm text-[#740505] font-bold`}>Daftar Sekarang</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
