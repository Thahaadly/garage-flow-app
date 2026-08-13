<?php
$customer = App\Models\User::where('role', 'Customer')->first();

if (!$customer) {
    echo "TIDAK ADA AKUN CUSTOMER DI DATABASE!\n";
    exit;
}

echo "Membuat data untuk Customer: " . $customer->email . "\n";

$service = App\Models\Service::first();
if (!$service) {
    echo "TIDAK ADA DATA SERVICE!\n";
    exit;
}

$vehicle = App\Models\Vehicle::where('user_id', $customer->id)->first();
if (!$vehicle) {
    echo "Customer belum punya kendaraan, saya buatkan satu...\n";
    $vehicle = App\Models\Vehicle::create([
        'user_id' => $customer->id,
        'brand' => 'Toyota',
        'model' => 'Innova',
        'year' => 2022,
        'license_plate' => 'B 1234 CD',
        'mileage' => 15000
    ]);
}

for ($i = 1; $i <= 10; $i++) {
    $booking = App\Models\Booking::create([
        'user_id' => $customer->id,
        'vehicle_id' => $vehicle->id,
        'service_id' => $service->id,
        'booking_date' => now()->addDays($i),
        'status' => 'pending_payment',
        'total_price' => 150000,
    ]);

    App\Models\Payment::create([
        'booking_id' => $booking->id,
        'order_id' => 'BOOK-' . $booking->id . '-' . time() . $i,
        'amount' => 150000,
        'status' => 'pending'
    ]);
}

echo "BERHASIL: 10 Pesanan telah dibuat!\n";
echo "Pastikan Anda login di aplikasi menggunakan email: " . $customer->email . "\n";
