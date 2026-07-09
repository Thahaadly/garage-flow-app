import { useCallback, useState } from 'react';
import { apiGet, getApiErrorMessage } from '@/src/lib/api';
import type { Vehicle } from '@/src/types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Vehicle[]>('/vehicles');
      setVehicles(data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar kendaraan.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    vehicles,
    setVehicles,
    isLoading,
    error,
    loadVehicles,
  };
}
