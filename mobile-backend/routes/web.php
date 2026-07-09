<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/model-files/{folder}/{file}', function ($folder, $file) {
    $path = public_path("models/{$folder}/{$file}");
    if (!file_exists($path)) {
        abort(404);
    }
    
    $mime = mime_content_type($path);
    if (str_ends_with($file, '.gltf')) $mime = 'model/gltf+json';
    if (str_ends_with($file, '.glb')) $mime = 'model/gltf-binary';
    if (str_ends_with($file, '.bin')) $mime = 'application/octet-stream';
    
    return response()->file($path, [
        'Content-Type' => $mime,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    ]);
})->where('file', '.*');
