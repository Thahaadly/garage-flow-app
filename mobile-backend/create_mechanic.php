<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::firstOrCreate(
    ['email' => 'mekanik@bengkel.com'],
    [
        'name' => 'Mekanik Handal',
        'password' => bcrypt('password'),
        'role' => 'Mekanik'
    ]
);
$user->assignRole('Mekanik');
echo "Mechanic created successfully!\n";
