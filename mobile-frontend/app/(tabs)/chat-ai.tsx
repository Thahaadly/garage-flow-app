import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import twrnc from 'twrnc';

import { apiPost } from '@/src/lib/api';

type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export default function ChatAiScreen() {
  const tw = twrnc;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'ai',
      text: 'Halo! Ada yang bisa saya bantu terkait mobil Anda hari ini?',
    },
    {
      id: 'm2',
      role: 'user',
      text: 'Mobil saya bunyi kletek-kletek saat distarter',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const data = useMemo(() => messages.slice().reverse(), [messages]);

  const handleSend = async () => {
    const userText = inputText.trim();
    if (!userText || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiPost<{ reply?: string }>('/chat', { message: userText });
      const replyText = response.data?.reply ?? 'Maaf, saya belum bisa menjawab saat ini.';
      const aiMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: replyText,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorReply =
        isAxiosError(error) && typeof error.response?.data?.reply === 'string'
          ? error.response?.data?.reply
          : null;
      const errorMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: errorReply ?? 'Maaf, koneksi bermasalah. Coba lagi ya.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <View style={tw`bg-white px-4 pb-4 pt-12 shadow-sm`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`h-10 w-10 items-center justify-center rounded-full bg-slate-100`}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#111827" />
          </View>
          <View style={tw`ml-3`}>
            <Text style={tw`text-base font-bold text-slate-900`}>
              Montir AI - Asisten GarageFlow
            </Text>
            <Text style={tw`text-xs text-slate-500`}>Chat otomotif cepat</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={data}
        inverted
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-4 pb-4 pt-6`}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';

          return (
            <View style={tw`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
              <View
                style={tw`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isUser ? 'bg-red-600' : 'bg-white'
                }`}>
                <Text style={tw`${isUser ? 'text-white' : 'text-slate-900'} text-sm`}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {isLoading ? (
        <View style={tw`px-4 pb-2`}>
          <View style={tw`flex-row items-center`}>
            <ActivityIndicator size="small" color="#dc2626" />
            <Text style={tw`ml-2 text-xs text-slate-500`}>
              Montir AI sedang mengetik...
            </Text>
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
        style={tw`bg-white px-4 pb-4 pt-3`}>
        <View style={tw`flex-row items-center`}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tanya seputar mobil..."
            style={tw`flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900`}
            placeholderTextColor="#94a3b8"
          />
          <Pressable
            onPress={handleSend}
            style={tw`ml-3 h-10 w-10 items-center justify-center rounded-full bg-red-600`}>
            <Ionicons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}