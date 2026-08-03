<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Service $service;

    private \App\Models\Vehicle $vehicle;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->vehicle = \App\Models\Vehicle::factory()->create(['user_id' => $this->user->id]);
        $this->service = Service::factory()->create([
            'name' => 'Servis Ringan',
            'estimated_duration' => 45,
            'estimated_price' => 150000,
        ]);
    }

    // ─── Index ───────────────────────────────────────────────────────

    public function test_list_bookings(): void
    {
        Booking::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'vehicle_id' => $this->vehicle->id,
            'service_id' => $this->service->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/bookings');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'meta' => ['code', 'status', 'message'],
                'data' => [
                    '*' => ['id', 'user_id', 'service_id', 'booking_date', 'status'],
                ],
                'pagination',
            ]);
    }

    // ─── Store ───────────────────────────────────────────────────────

    public function test_create_booking(): void
    {
        $scheduledAt = now()->addDays(5)->setTime(10, 0)->toDateTimeString();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'service_id' => $this->service->id,
                'vehicle_id' => $this->vehicle->id,
                'booking_date' => $scheduledAt,
                'notes' => 'First booking',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.notes', 'First booking');

        $this->assertDatabaseHas('bookings', [
            'user_id' => $this->user->id,
            'service_id' => $this->service->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_create_booking_with_past_date(): void
    {
        $pastDate = now()->subDay()->toDateTimeString();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'service_id' => $this->service->id,
                'vehicle_id' => $this->vehicle->id,
                'booking_date' => $pastDate,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('meta.status', 'error');
    }

    // ─── Show ────────────────────────────────────────────────────────

    public function test_show_booking(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'vehicle_id' => $this->vehicle->id,
            'service_id' => $this->service->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.id', $booking->id);
    }

    public function test_show_other_users_booking(): void
    {
        $otherUser = User::factory()->create();
        $otherVehicle = \App\Models\Vehicle::factory()->create(['user_id' => $otherUser->id]);
        $booking = Booking::factory()->create([
            'user_id' => $otherUser->id,
            'vehicle_id' => $otherVehicle->id,
            'service_id' => $this->service->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/bookings/{$booking->id}");

        $response->assertStatus(404)
            ->assertJsonPath('meta.status', 'error');
    }

    // ─── Update ──────────────────────────────────────────────────────

    public function test_update_booking_status(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'vehicle_id' => $this->vehicle->id,
            'service_id' => $this->service->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/bookings/{$booking->id}", [
                'status' => 'cancelled',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);
    }
}
