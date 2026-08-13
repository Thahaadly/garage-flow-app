<?php
$user = App\Models\User::where('role', 'Customer')->first();
$service = App\Models\Service::first();
$vehicle = App\Models\Vehicle::first(); // Just get any vehicle

if (!$vehicle) {
    echo "Tidak ada kendaraan di database, tidak bisa buat pesanan.\n";
    exit;
}

for ($i = 1; $i <= 5; $i++) {
    $booking = App\Models\Booking::create([
        'user_id' => $vehicle->user_id, // Use the vehicle's owner
        'vehicle_id' => $vehicle->id,
        'service_id' => $service->id,
        'booking_date' => now()->addDays($i + 15),
        'status' => 'pending_payment',
        'total_price' => 200000,
    ]);

    App\Models\Payment::create([
        'booking_id' => $booking->id,
        'order_id' => 'BOOK-' . $booking->id . '-' . time() . $i,
        'amount' => 200000,
        'status' => 'pending'
    ]);
}
echo "5 Pesanan palsu tambahan berhasil dibuat (kali ini beneran)!\n";
