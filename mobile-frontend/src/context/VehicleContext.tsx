import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiGet, getApiErrorMessage } from '@/src/lib/api';
import type { Vehicle } from '@/src/types';

interface VehicleContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  loadVehicles: () => Promise<void>;
  
  activeVehicleId: number | null;
  setActiveVehicleId: (id: number | null) => void;
  
  activeCarColor: string;
  setActiveCarColor: (color: string) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global selections
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const [activeCarColor, setActiveCarColor] = useState<string>('#ffffff'); // Default white

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Vehicle[]>('/vehicles');
      setVehicles(data || []);
      
      // If we load vehicles and don't have an active one, pick the first
      if (data && data.length > 0) {
        // Only set default if we don't already have one selected
        setActiveVehicleId((prev) => {
          if (!prev || !data.find(v => v.id === prev)) {
             return data[0].id;
          }
          return prev;
        });
      } else {
        setActiveVehicleId(null);
      }
      
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar kendaraan.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        isLoading,
        error,
        loadVehicles,
        activeVehicleId,
        setActiveVehicleId,
        activeCarColor,
        setActiveCarColor,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useGlobalVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useGlobalVehicles must be used within a VehicleProvider');
  }
  return context;
}
