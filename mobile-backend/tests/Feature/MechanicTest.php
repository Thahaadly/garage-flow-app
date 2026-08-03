<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MechanicTest extends TestCase
{
    use RefreshDatabase;

    private User $mechanic;
    private User $customer;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Role
        Role::create(['name' => 'Mekanik', 'guard_name' => 'web']);
        
        // Setup Mechanic
        $this->mechanic = User::factory()->create();
        $this->mechanic->assignRole('Mekanik');

        // Setup Customer & Booking
        $this->customer = User::factory()->create();
        $vehicle = Vehicle::factory()->create(['user_id' => $this->customer->id]);
        $service = Service::factory()->create(['estimated_price' => 150000]);

        $this->booking = Booking::factory()->create([
            'user_id' => $this->customer->id,
            'vehicle_id' => $vehicle->id,
            'service_id' => $service->id,
            'status' => 'scheduled',
            'total_price' => 0,
        ]);
    }

    public function test_mechanic_can_view_active_bookings(): void
    {
        $response = $this->actingAs($this->mechanic, 'sanctum')->getJson('/api/mechanic/bookings');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(1, 'data');
    }

    public function test_mechanic_can_add_items_and_change_status_to_pending_payment(): void
    {
        $response = $this->actingAs($this->mechanic, 'sanctum')->postJson("/api/mechanic/bookings/{$this->booking->id}/items", [
            'items' => [
                [
                    'item_name' => 'Oli Mesin',
                    'type' => 'part',
                    'price' => 50000,
                    'quantity' => 2,
                ],
                [
                    'item_name' => 'Jasa Ganti Oli',
                    'type' => 'service',
                    'price' => 20000,
                    'quantity' => 1,
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.status', 'pending_payment')
            ->assertJsonPath('data.total_price', 120000);

        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'status' => 'pending_payment',
            'total_price' => 120000,
        ]);

        $this->assertDatabaseHas('booking_items', [
            'booking_id' => $this->booking->id,
            'item_name' => 'Oli Mesin',
            'subtotal' => 100000,
        ]);
    }

    public function test_mechanic_can_update_status(): void
    {
        $response = $this->actingAs($this->mechanic, 'sanctum')->postJson("/api/mechanic/bookings/{$this->booking->id}/status", [
            'status' => 'in_progress'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');

        $responseCompleted = $this->actingAs($this->mechanic, 'sanctum')->postJson("/api/mechanic/bookings/{$this->booking->id}/status", [
            'status' => 'completed'
        ]);

        $responseCompleted->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
            
        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'status' => 'completed',
        ]);
    }

    public function test_mechanic_can_view_history(): void
    {
        $this->booking->update(['status' => 'completed']);

        $response = $this->actingAs($this->mechanic, 'sanctum')->getJson('/api/mechanic/bookings/history');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
