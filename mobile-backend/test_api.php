<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$bookings = App\Models\Booking::with('service', 'user', 'vehicle')
    ->whereIn('status', ['scheduled', 'pending_payment', 'confirmed', 'in_progress'])
    ->orderBy('booking_date', 'asc')
    ->get();

echo json_encode($bookings->toArray(), JSON_PRETTY_PRINT);
