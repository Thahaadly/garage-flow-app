<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');
$cleanApiKey = trim($apiKey);

echo "Testing HTTP Facade...\n";

$http = Http::withHeaders([
    'Content-Type' => 'application/json',
]);

if (config('app.env') !== 'production') {
    $http = $http->withoutVerifying();
}

try {
    $response = $http->timeout(5)->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $cleanApiKey, [
        'contents' => [
            ['parts' => [['text' => 'Hello']]]
        ]
    ]);
    
    echo "Status: " . $response->status() . "\n";
    echo "Body: " . $response->body() . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
