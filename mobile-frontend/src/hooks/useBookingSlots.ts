import { useState, useEffect } from 'react';
import { apiGet } from '@/src/lib/api';

export function useBookingSlots(
  isBookingModalVisible: boolean,
  selectedServiceId: number | null,
  selectedDateString: string
) {
  const [slotOptions, setSlotOptions] = useState<{start: string, end: string, available: boolean}[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSlots = async () => {
      if (!isBookingModalVisible || !selectedServiceId || !selectedDateString) return;
      setIsSlotsLoading(true);
      try {
        const data = await apiGet<any>('/schedules', {
          service_id: selectedServiceId,
          date: selectedDateString,
        });
        if (isMounted) setSlotOptions(data?.slots || []);
      } catch {
        if (isMounted) setSlotOptions([]);
      } finally {
        if (isMounted) setIsSlotsLoading(false);
      }
    };
    fetchSlots();
    return () => { isMounted = false; };
  }, [isBookingModalVisible, selectedServiceId, selectedDateString]);

  return { slotOptions, isSlotsLoading };
}
