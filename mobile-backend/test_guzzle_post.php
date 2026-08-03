<?php
require __DIR__.'/vendor/autoload.php';

$client = new \GuzzleHttp\Client();
try {
    $res = $client->request('POST', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=AIzaSyD39K2eh32y8jps-HBOnBhI1tE75-G9REk', [
        'verify' => false,
        'timeout' => 15,
        'json' => [
            'contents' => [
                ['parts' => [['text' => 'Hello']]]
            ]
        ]
    ]);
    echo "Status: " . $res->getStatusCode() . "\n";
    echo $res->getBody();
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
