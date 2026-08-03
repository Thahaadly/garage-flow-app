<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_own_vehicles(): void
    {
        Vehicle::factory()->count(2)->create(['user_id' => $this->user->id]);
        $otherUser = User::factory()->create();
        Vehicle::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/vehicles');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(2, 'data');
    }

    public function test_can_create_vehicle(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/vehicles', [
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2020,
            'license_plate' => 'B 1234 ABC',
            'color' => 'Black',
            'mileage' => 15000,
            'fuel_type' => 'Petrol',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.brand', 'Toyota');
    }

    public function test_can_show_own_vehicle(): void
    {
        $vehicle = Vehicle::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/vehicles/' . $vehicle->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $vehicle->id);
    }

    public function test_cannot_show_others_vehicle(): void
    {
        $otherUser = User::factory()->create();
        $vehicle = Vehicle::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/vehicles/' . $vehicle->id);

        $response->assertStatus(404);
    }

    public function test_can_update_vehicle(): void
    {
        $vehicle = Vehicle::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')->putJson('/api/vehicles/' . $vehicle->id, [
            'color' => 'Red',
            'mileage' => 20000,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'color' => 'Red',
            'mileage' => 20000,
        ]);
    }

    public function test_can_delete_vehicle(): void
    {
        $vehicle = Vehicle::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')->deleteJson('/api/vehicles/' . $vehicle->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('vehicles', ['id' => $vehicle->id]);
    }
}
