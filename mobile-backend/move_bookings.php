<?php
$oldUser = App\Models\User::find(1);
$newUser = App\Models\User::where('email', 'test@example.com')->first();

if ($newUser && $oldUser) {
    App\Models\Vehicle::where('user_id', $oldUser->id)->update(['user_id' => $newUser->id]);
    App\Models\Booking::where('user_id', $oldUser->id)->update(['user_id' => $newUser->id]);
    echo "Semua pesanan dan kendaraan telah dipindahkan ke akun: " . $newUser->email . "\n";
} else {
    echo "Gagal menemukan akun.\n";
}
