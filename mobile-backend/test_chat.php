<?php
// Test Chat Endpoint locally
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::first();
if (!$user) {
    echo "No user found. Please run seeders or register a user.\n";
    exit;
}

$request = Illuminate\Http\Request::create('/api/chat', 'POST', ['message' => 'Halo montir!']);
$request->setUserResolver(function () use ($user) { return $user; });

$response = $kernel->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
