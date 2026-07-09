import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import twrnc from 'twrnc';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/src/lib/api';
import type { Sparepart } from '@/src/types';

export default function SparepartsScreen() {
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSpareparts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const items = await apiGet<Sparepart[]>('/spareparts');
      setSpareparts(items ?? []);
    } catch {
      setError('Gagal memuat sparepart.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpareparts();
  }, [loadSpareparts]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSpareparts();
    setRefreshing(false);
  }, [loadSpareparts]);

  return (
    <ScrollView 
      style={twrnc`flex-1`}
      contentContainerStyle={twrnc`px-6 pt-12 pb-10`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} />
      }
    >
      <ThemedText type="title">Katalog Sparepart</ThemedText>
      <ThemedText style={twrnc`mt-2 text-slate-600`}>
        Jelajahi daftar sparepart yang tersedia.
      </ThemedText>

      {isLoading ? (
        <ThemedView style={twrnc`mt-6 flex-row flex-wrap justify-between`}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={twrnc`mb-4 w-[48%]`}>
              <Card tone="muted" style={twrnc`h-28`}>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </Card>
            </View>
          ))}
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedText style={twrnc`mt-6 text-red-600`}>{error}</ThemedText>
      ) : null}

      {!isLoading && !error && spareparts.length === 0 ? (
        <ThemedText style={twrnc`mt-6 text-slate-600`}>
          Belum ada sparepart yang tersedia.
        </ThemedText>
      ) : null}

      {!isLoading && spareparts.length > 0 ? (
        <ThemedView style={twrnc`mt-6 flex-row flex-wrap justify-between`}>
          {spareparts.map((item) => (
            <ThemedView key={item.id} style={twrnc`mb-4 w-[48%]`}>
              <Card tone="muted">
                <ThemedText type="subtitle">{item.name}</ThemedText>
                {item.description ? (
                  <ThemedText style={twrnc`mt-1 text-slate-600`}>{item.description}</ThemedText>
                ) : null}
                {typeof item.price === 'number' ? (
                  <ThemedText style={twrnc`mt-2 text-slate-800`}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </ThemedText>
                ) : null}
              </Card>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}
