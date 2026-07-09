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

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->service = Service::factory()->create([
            'name' => 'Servis Ringan',
            'duration' => 45,
            'price' => 150000,
        ]);
    }

    // ─── Index ───────────────────────────────────────────────────────

    public function test_list_bookings(): void
    {
        Booking::factory()->count(3)->create([
            'user_id' => $this->user->id,
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
                    '*' => ['id', 'user_id', 'service_id', 'scheduled_at', 'status'],
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
                'scheduled_at' => $scheduledAt,
                'notes' => 'First booking',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.notes', 'First booking');

        $this->assertDatabaseHas('bookings', [
            'user_id' => $this->user->id,
            'service_id' => $this->service->id,
            'status' => 'pending',
        ]);
    }

    public function test_create_booking_with_past_date(): void
    {
        $pastDate = now()->subDay()->toDateTimeString();

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'service_id' => $this->service->id,
                'scheduled_at' => $pastDate,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('meta.status', 'error');
    }

    // ─── Show ────────────────────────────────────────────────────────

    public function test_show_booking(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
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
        $booking = Booking::factory()->create([
            'user_id' => $otherUser->id,
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
