<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\PushNotificationService;

class MechanicController extends Controller
{
    use ApiResponse;

    // List bookings for mechanic (only scheduled, pending_payment, confirmed, in_progress, completed today?)
    // For simplicity, we just return all active ones for now
    public function index(Request $request)
    {
        // Require role mechanic or admin
        // if (!$request->user()->hasRole(['Admin', 'Mekanik'])) {
        //     return $this->errorResponse('Unauthorized', 403);
        // }

        $bookings = Booking::with('service', 'user', 'vehicle')
            ->whereIn('status', ['scheduled', 'pending_payment', 'confirmed', 'in_progress'])
            ->orderBy('booking_date', 'asc')
            ->get();

        return $this->resourceResponse($bookings, 'Daftar Pekerjaan Mekanik');
    }

    public function show($id)
    {
        $booking = Booking::with('service', 'user', 'vehicle', 'items')
            ->findOrFail($id);

        return $this->resourceResponse($booking, 'Detail Booking');
    }

    public function addItems(Request $request, $id)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.item_name' => 'required|string',
            'items.*.type' => 'required|in:part,service',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'scheduled') {
            return $this->errorResponse('Hanya pesanan berstatus scheduled yang bisa diinput tagihan', 400);
        }

        DB::beginTransaction();
        try {
            // Hapus item lama jika ada (untuk replace)
            $booking->items()->delete();

            $totalPrice = 0;
            foreach ($validated['items'] as $item) {
                $subtotal = $item['price'] * $item['quantity'];
                $totalPrice += $subtotal;

                $booking->items()->create([
                    'item_name' => $item['item_name'],
                    'type' => $item['type'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ]);
            }

            $booking->update([
                'total_price' => $totalPrice,
                'status' => 'pending_payment'
            ]);

            DB::commit();

            // Send notification to customer
            if ($booking->user) {
                PushNotificationService::send(
                    $booking->user,
                    'Tagihan Servis Masuk',
                    'Mekanik telah mengonfirmasi perbaikan. Silakan cek tagihan Anda.'
                );
            }

            return $this->resourceResponse(
                $booking->fresh()->load('items'),
                'Tagihan berhasil dikirim ke pelanggan'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal menginput tagihan: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed',
        ]);

        $booking = Booking::findOrFail($id);

        // Optional: Update last_service_mileage if completed
        if ($validated['status'] === 'completed' && $booking->vehicle) {
            $booking->vehicle->update([
                'last_service_mileage' => $booking->vehicle->mileage,
                'last_service_date' => now()
            ]);
        }

        $booking->update(['status' => $validated['status']]);

        // Send notification to customer
        if ($booking->user) {
            $msg = $validated['status'] === 'in_progress' 
                ? 'Mekanik sedang mengerjakan kendaraan Anda.' 
                : 'Servis kendaraan Anda telah selesai!';
                
            PushNotificationService::send(
                $booking->user,
                'Update Status Servis',
                $msg
            );
        }

        return $this->resourceResponse($booking, 'Status berhasil diperbarui');
    }

    public function history(Request $request)
    {
        $bookings = Booking::with('service', 'user', 'vehicle')
            ->where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse($bookings, BookingResource::class, 'Riwayat Pekerjaan Mekanik');
    }
}
