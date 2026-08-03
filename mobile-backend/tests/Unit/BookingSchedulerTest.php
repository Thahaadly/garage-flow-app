<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Services\BookingScheduler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BookingSchedulerTest extends TestCase
{
    use RefreshDatabase;

    private BookingScheduler $scheduler;

    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->scheduler = new BookingScheduler();
        $this->service = Service::factory()->create([
            'name' => 'Test Service',
            'estimated_duration' => 30,
            'estimated_price' => 100000,
        ]);
    }

    // ─── buildSlots ──────────────────────────────────────────────────

    public function test_slot_generation_returns_correct_format(): void
    {
        // Use a future date to ensure all slots are valid
        $date = Carbon::tomorrow()->startOfDay();

        $slots = $this->scheduler->buildSlots($date, $this->service);

        $this->assertIsArray($slots);
        $this->assertNotEmpty($slots);

        $firstSlot = $slots[0];
        $this->assertArrayHasKey('start', $firstSlot);
        $this->assertArrayHasKey('end', $firstSlot);
        $this->assertArrayHasKey('available', $firstSlot);
        $this->assertIsBool($firstSlot['available']);

        // start/end should be in H:i format
        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}$/', $firstSlot['start']);
        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}$/', $firstSlot['end']);
    }

    public function test_slots_respect_open_close_hours(): void
    {
        $date = Carbon::tomorrow()->startOfDay();

        $slots = $this->scheduler->buildSlots($date, $this->service);

        foreach ($slots as $slot) {
            $startMinutes = $this->timeToMinutes($slot['start']);
            $endMinutes = $this->timeToMinutes($slot['end']);

            // Slots must start at or after 09:00 (540 min)
            $this->assertGreaterThanOrEqual(540, $startMinutes, "Slot {$slot['start']} starts before 09:00");
            // Slots must end at or before 17:00 (1020 min)
            $this->assertLessThanOrEqual(1020, $endMinutes, "Slot {$slot['end']} ends after 17:00");
        }
    }

    public function test_slots_skip_lunch_break(): void
    {
        $date = Carbon::tomorrow()->startOfDay();

        $slots = $this->scheduler->buildSlots($date, $this->service);

        // No slot should be marked available if it overlaps 12:00-13:00
        foreach ($slots as $slot) {
            $startMinutes = $this->timeToMinutes($slot['start']);
            $endMinutes = $this->timeToMinutes($slot['end']);

            $overlapsLunch = $startMinutes < 780 && $endMinutes > 720; // 12:00=720, 13:00=780

            if ($overlapsLunch) {
                $this->assertFalse(
                    $slot['available'],
                    "Slot {$slot['start']}-{$slot['end']} overlaps lunch but is marked available"
                );
            }
        }
    }

    // ─── isSlotAvailable ─────────────────────────────────────────────

    public function test_is_slot_available_returns_false_for_slot_outside_hours(): void
    {
        // 07:00 is before opening time (09:00)
        $earlySlot = Carbon::tomorrow()->setTime(7, 0);

        $result = $this->scheduler->isSlotAvailable(
            $this->service->id,
            $earlySlot
        );

        $this->assertFalse($result, 'Slot before opening hours should be unavailable');

        // 17:00 would end after closing for a 30-min service
        $lateSlot = Carbon::tomorrow()->setTime(16, 45);

        $result2 = $this->scheduler->isSlotAvailable(
            $this->service->id,
            $lateSlot
        );

        $this->assertFalse($result2, 'Slot that ends after closing hours should be unavailable');
    }

    public function test_is_slot_available_returns_false_for_fully_booked_slots(): void
    {
        $user = User::factory()->create();
        $scheduledAt = Carbon::tomorrow()->setTime(10, 0);

        // Book 3 slots at the same time (BAY_CAPACITY = 3)
        for ($i = 0; $i < 3; $i++) {
            Booking::factory()->create([
                'user_id' => $user->id,
                'service_id' => $this->service->id,
                'booking_date' => $scheduledAt,
                'status' => 'pending',
            ]);
        }

        $result = $this->scheduler->isSlotAvailable(
            $this->service->id,
            $scheduledAt
        );

        $this->assertFalse($result, 'Slot should be unavailable when fully booked');
    }

    public function test_is_slot_available_returns_true_for_open_slot(): void
    {
        $scheduledAt = Carbon::tomorrow()->setTime(10, 0);

        $result = $this->scheduler->isSlotAvailable(
            $this->service->id,
            $scheduledAt
        );

        $this->assertTrue($result, 'Slot should be available when no bookings exist');
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = explode(':', $time);

        return (int) $hours * 60 + (int) $minutes;
    }
}
