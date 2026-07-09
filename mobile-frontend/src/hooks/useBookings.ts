import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiGet, apiPost, getApiErrorMessage } from '@/src/lib/api';
import type { Booking, Service } from '@/src/types';

export function useBookings(services: Service[]) {
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [activeBookingLabel, setActiveBookingLabel] = useState('');
  const [activeBookingStatus, setActiveBookingStatus] = useState('');
  const [activeBookingDetails, setActiveBookingDetails] = useState<
    | {
        id: number;
        serviceName: string;
        scheduledAt: string;
        status: string;
        total_price: number;
        items: any[];
      }
    | null
  >(null);

  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const bookings = await apiGet<Booking[]>('/bookings');

      const items = bookings ?? [];
      const sortedItems = [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setBookingHistory(sortedItems);

      const active = sortedItems.find((booking) =>
        ['scheduled', 'pending_payment', 'pending', 'confirmed'].includes(booking.status ?? '')
      );

      if (active) {
        const status = active.status ?? '';
        const serviceName = active.service?.name ?? 'Servis';
        const scheduledAt = active.booking_date ?? active.scheduled_at ?? '';

        setHasActiveBooking(true);
        setActiveBookingStatus(status);
        setActiveBookingLabel(
          scheduledAt ? `${serviceName} - ${scheduledAt}` : serviceName
        );
        setActiveBookingDetails({
          id: active.id ?? 0,
          serviceName,
          scheduledAt,
          status,
          total_price: (active as any).total_price ?? 0,
          items: (active as any).items ?? [],
        });
      } else {
        setHasActiveBooking(false);
        setActiveBookingLabel('');
        setActiveBookingStatus('');
        setActiveBookingDetails(null);
      }
    } catch {
      setBookingHistory([]);
      setHasActiveBooking(false);
      setActiveBookingLabel('');
      setActiveBookingStatus('');
      setActiveBookingDetails(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const submitBooking = async (
    selectedServiceId: number | null,
    selectedVehicleId: number | null,
    selectedDateString: string,
    selectedSlot: string,
    onSuccess: (bookingId: number) => void
  ) => {
    if (!selectedServiceId || !selectedVehicleId || !selectedSlot || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    const scheduledAt = selectedSlot.includes('T')
      ? selectedSlot
      : `${selectedDateString} ${selectedSlot}`;

    try {
      const response = await apiPost<{ data: { id: number } }>('/bookings', {
        service_id: selectedServiceId,
        vehicle_id: selectedVehicleId,
        booking_date: scheduledAt,
        notes: null,
      });

      const bookingId = response.data.data.id;
      const serviceName = services.find((service) => service.id === selectedServiceId)?.name;
      const label = `${serviceName ?? 'Servis'} - ${selectedDateString}, ${selectedSlot}`;
      const scheduledAtDisplay = `${selectedDateString} ${selectedSlot}`;

      setActiveBookingLabel(label);
      setActiveBookingDetails({
        id: bookingId,
        serviceName: serviceName ?? 'Servis',
        scheduledAt: scheduledAtDisplay,
        status: 'scheduled',
        total_price: 0,
        items: [],
      });
      setHasActiveBooking(true);
      
      setBookingHistory((prev) => [
        {
          id: bookingId,
          status: 'scheduled',
          scheduled_at: scheduledAtDisplay,
          service: {
            id: selectedServiceId ?? 0,
            name: serviceName ?? 'Servis',
          },
        },
        ...prev,
      ]);
      
      onSuccess(bookingId);
    } catch (err) {
      setBookingError(getApiErrorMessage(err, 'Booking gagal. Coba pilih jadwal lain.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    hasActiveBooking,
    bookingHistory,
    activeBookingLabel,
    activeBookingStatus,
    activeBookingDetails,
    bookingError,
    isSubmitting,
    submitBooking,
    setBookingError,
    reloadBookings: loadBookings,
  };
}
