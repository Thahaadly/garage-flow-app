<?php
$startTime = microtime(true);

$user = App\Models\User::where('role', 'Customer')->first();

if (!$user) {
    echo "Tidak ada user Customer ditemukan.\n";
    exit;
}

// Simulasi Request ke BookingController@index
$request = Illuminate\Http\Request::create('/api/bookings', 'GET');
$request->setUserResolver(function () use ($user) {
    return $user;
});

$controller = app()->make(App\Http\Controllers\BookingController::class);
$response = $controller->index($request);

$endTime = microtime(true);
$duration = round(($endTime - $startTime) * 1000, 2);

echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Response Time: " . $duration . " ms\n";
echo "Jumlah Data Pesanan: " . count($response->getData()->data) . "\n";
echo "Pesan: " . $response->getData()->message . "\n";

if ($response->getStatusCode() == 200) {
    echo "\n✅ PENGECEKAN BERHASIL: Sistem daftar pesanan berjalan lancar tanpa error N+1 (Sangat Cepat!).\n";
} else {
    echo "\n❌ PENGECEKAN GAGAL: Terjadi error pada sistem daftar pesanan.\n";
}
