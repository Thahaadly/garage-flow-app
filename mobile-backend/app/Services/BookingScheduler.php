<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Support\Carbon;

class BookingScheduler
{
    private const ACTIVE_STATUSES = ['pending', 'pending_payment', 'confirmed'];
    private const OPEN_TIME = '09:00';
    private const CLOSE_TIME = '17:00';
    private const SLOT_INTERVAL_MINUTES = 30;
    private const BAY_CAPACITY = 3;
    private const BREAK_START = '12:00';
    private const BREAK_END = '13:00';

    public function buildSlots(Carbon $date, Service $service): array
    {
        $openAt = $date->copy()->setTimeFromTimeString(self::OPEN_TIME);
        $closeAt = $date->copy()->setTimeFromTimeString(self::CLOSE_TIME);
        $slotStart = $openAt->copy();
        $durationMinutes = $service->estimated_duration;
        $now = Carbon::now();
        $breakStart = $date->copy()->setTimeFromTimeString(self::BREAK_START);
        $breakEnd = $date->copy()->setTimeFromTimeString(self::BREAK_END);

        $bookings = Booking::query()
            ->with('service:id,estimated_duration')
            ->whereDate('booking_date', $date->toDateString())
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->get(['id', 'service_id', 'booking_date', 'status']);

        $reserved = $bookings->map(function (Booking $booking) {
            $start = $booking->booking_date->copy();
            $serviceDuration = $booking->service?->estimated_duration ?? 0;

            return [
                'start' => $start,
                'end' => $start->copy()->addMinutes($serviceDuration),
            ];
        });

        $slots = [];

        while ($slotStart->copy()->addMinutes($durationMinutes)->lte($closeAt)) {
            $slotEnd = $slotStart->copy()->addMinutes($durationMinutes);
            $conflictsBreak = $slotStart->lt($breakEnd) && $slotEnd->gt($breakStart);
            $available = $slotEnd->gt($now)
                && ! $conflictsBreak
                && $this->isSlotFree($slotStart, $slotEnd, $reserved);

            $slots[] = [
                'start' => $slotStart->format('H:i'),
                'end' => $slotEnd->format('H:i'),
                'available' => $available,
            ];

            $slotStart->addMinutes(self::SLOT_INTERVAL_MINUTES);
        }

        return $slots;
    }

    public function isSlotAvailable(int $serviceId, Carbon $bookingDate, ?int $excludeBookingId = null): bool
    {
        $service = Service::findOrFail($serviceId);
        $date = $bookingDate->copy()->startOfDay();
        $durationMinutes = $service->estimated_duration;
        $openAt = $date->copy()->setTimeFromTimeString(self::OPEN_TIME);
        $closeAt = $date->copy()->setTimeFromTimeString(self::CLOSE_TIME);
        $slotEnd = $bookingDate->copy()->addMinutes($durationMinutes);
        $breakStart = $date->copy()->setTimeFromTimeString(self::BREAK_START);
        $breakEnd = $date->copy()->setTimeFromTimeString(self::BREAK_END);

        if ($bookingDate->lt($openAt) || $slotEnd->gt($closeAt)) {
            return false;
        }

        if ($bookingDate->lt($breakEnd) && $slotEnd->gt($breakStart)) {
            return false;
        }

        $query = Booking::query()
            ->with('service:id,estimated_duration')
            ->whereDate('booking_date', $date->toDateString())
            ->whereIn('status', self::ACTIVE_STATUSES);

        if ($excludeBookingId !== null) {
            $query->where('id', '!=', $excludeBookingId);
        }

        $bookings = $query->get(['id', 'service_id', 'booking_date', 'status']);

        $overlapCount = 0;

        foreach ($bookings as $booking) {
            $start = $booking->booking_date->copy();
            $bookingDuration = $booking->service?->estimated_duration ?? 0;
            $end = $start->copy()->addMinutes($bookingDuration);

            if ($bookingDate->lt($end) && $slotEnd->gt($start)) {
                $overlapCount++;
            }

            if ($overlapCount >= self::BAY_CAPACITY) {
                return false;
            }
        }

        return true;
    }

    private function isSlotFree(Carbon $slotStart, Carbon $slotEnd, $reserved): bool
    {
        $overlapCount = 0;

        foreach ($reserved as $range) {
            if ($slotStart->lt($range['end']) && $slotEnd->gt($range['start'])) {
                $overlapCount++;
            }

            if ($overlapCount >= self::BAY_CAPACITY) {
                return false;
            }
        }

        return true;
    }
}
