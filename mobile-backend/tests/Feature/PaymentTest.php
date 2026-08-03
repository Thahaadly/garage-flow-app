<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $vehicle = Vehicle::factory()->create(['user_id' => $this->user->id]);
        $service = Service::factory()->create(['estimated_price' => 150000]);

        $this->booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'vehicle_id' => $vehicle->id,
            'service_id' => $service->id,
            'status' => 'pending_payment',
            'total_price' => 150000,
        ]);
    }

    public function test_can_create_transaction(): void
    {
        $snapMock = \Mockery::mock('alias:Midtrans\Snap');
        $snapMock->shouldReceive('createTransaction')->andReturn((object) [
            'token' => 'dummy_snap_token',
            'redirect_url' => 'https://sandbox.midtrans.com/dummy',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/payments/transaction', [
            'booking_id' => $this->booking->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.snap_token', 'dummy_snap_token');

        $this->assertDatabaseHas('payments', [
            'booking_id' => $this->booking->id,
            'amount' => 150000,
        ]);
    }

    public function test_webhook_handler(): void
    {
        $orderId = 'BOOK-' . $this->booking->id . '-' . time();
        
        Payment::create([
            'booking_id' => $this->booking->id,
            'order_id' => $orderId,
            'amount' => 150000,
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
        ]);

        config(['midtrans.server_key' => 'dummy_server_key']);
        $statusCode = '200';
        $grossAmount = '150000.00';
        
        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . 'dummy_server_key');

        $response = $this->postJson('/api/payments/webhook', [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'capture',
            'fraud_status' => 'accept',
            'signature_key' => $signature,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('payments', [
            'order_id' => $orderId,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_sync_status(): void
    {
        Payment::create([
            'booking_id' => $this->booking->id,
            'order_id' => 'dummy_order_id',
            'amount' => 150000,
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/payments/' . $this->booking->id . '/sync-status');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'status' => 'confirmed',
        ]);
    }
}
