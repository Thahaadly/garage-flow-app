<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\AdminBrandController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminSparepartController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/services', [ServiceController::class, 'index']); // Anyone can view services
Route::post('/payments/webhook', [PaymentController::class, 'webhookHandler']); // Midtrans webhook

// Protected Routes (Requires Login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Customer / Common Routes
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/payments/transaction', [PaymentController::class, 'createTransaction']);
    Route::get('/payments/{booking}/sync-status', [PaymentController::class, 'syncStatus']);
    
    // Admin Only Routes
    Route::middleware(['role:Admin'])->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        
        Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']); // Admin updates status
    });

    // Mekanik Only Routes
    Route::middleware(['role:Mekanik,Admin'])->prefix('mechanic')->group(function () {
        Route::get('/bookings', [\App\Http\Controllers\MechanicController::class, 'index']);
        Route::get('/bookings/history', [\App\Http\Controllers\MechanicController::class, 'history']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\MechanicController::class, 'show']);
        Route::post('/bookings/{id}/items', [\App\Http\Controllers\MechanicController::class, 'addItems']);
        Route::post('/bookings/{id}/status', [\App\Http\Controllers\MechanicController::class, 'updateStatus']);
    });
    
    // Admin & Mekanik Shared Routes
    // (all-bookings moved to admin)
    Route::get('profile', [AuthController::class, 'profile']);
    Route::put('profile', [AuthController::class, 'updateProfile']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::put('bookings/{booking}', [BookingController::class, 'update']);
    Route::get('schedules', [BookingController::class, 'schedules']);
    Route::apiResource('vehicles', \App\Http\Controllers\VehicleController::class);
});

Route::get('spareparts', [SparepartController::class, 'index']);
Route::get('spareparts/search', [SparepartController::class, 'search']);
Route::get('spareparts/{sparepart}', [SparepartController::class, 'show']);
Route::get('categories', [SparepartController::class, 'categories']);
Route::get('brands', [SparepartController::class, 'brands']);
Route::post('chat', [ChatController::class, 'ask']);

Route::middleware(['auth:sanctum', 'role:Admin'])->prefix('admin')->group(function () {
    Route::get('bookings', [AdminBookingController::class, 'index']);
    Route::get('bookings/{booking}', [AdminBookingController::class, 'show']);
    Route::put('bookings/{booking}', [AdminBookingController::class, 'update']);
    Route::get('all-bookings', [\App\Http\Controllers\BookingController::class, 'allBookings']);

    Route::get('categories', [AdminCategoryController::class, 'index']);
    Route::post('categories', [AdminCategoryController::class, 'store']);
    Route::put('categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);

    Route::get('brands', [AdminBrandController::class, 'index']);
    Route::post('brands', [AdminBrandController::class, 'store']);
    Route::put('brands/{brand}', [AdminBrandController::class, 'update']);
    Route::delete('brands/{brand}', [AdminBrandController::class, 'destroy']);

    Route::get('services', [AdminServiceController::class, 'index']);
    Route::post('services', [AdminServiceController::class, 'store']);
    Route::put('services/{service}', [AdminServiceController::class, 'update']);
    Route::delete('services/{service}', [AdminServiceController::class, 'destroy']);

    Route::get('spareparts', [AdminSparepartController::class, 'index']);
    Route::post('spareparts', [AdminSparepartController::class, 'store']);
    Route::put('spareparts/{sparepart}', [AdminSparepartController::class, 'update']);
    Route::delete('spareparts/{sparepart}', [AdminSparepartController::class, 'destroy']);
});
