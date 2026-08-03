<?php
require __DIR__.'/vendor/autoload.php';

$client = new \GuzzleHttp\Client();
try {
    $res = $client->request('GET', 'https://generativelanguage.googleapis.com', [
        'verify' => false,
        'timeout' => 5
    ]);
    echo $res->getStatusCode();
} catch (\Exception $e) {
    echo $e->getMessage();
}
