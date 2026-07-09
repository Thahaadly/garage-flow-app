import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/src/lib/api';
import type { Service } from '@/src/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const items = await apiGet<Service[]>('/services');
      setServices(items ?? []);
    } catch {
      setError('Gagal memuat layanan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return { services, isLoading, error, loadServices };
}
