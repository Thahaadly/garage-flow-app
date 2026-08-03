<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Services\BookingScheduler;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminBookingController extends Controller
{
    use ApiResponse;

    private const STATUSES = ['scheduled', 'pending', 'pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    public function index(Request $request)
    {
        $query = Booking::query()->with(['service', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('date')) {
            $date = Carbon::parse($request->string('date'))->toDateString();
            $query->whereDate('booking_date', $date);
        }

        $bookings = $query->orderByDesc('booking_date')
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($bookings, BookingResource::class, 'Booking list');
    }

    public function show(Booking $booking)
    {
        return $this->resourceResponse(
            (new BookingResource($booking->load(['service', 'user'])))->toArray(request()),
            'Booking detail'
        );
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:' . implode(',', self::STATUSES)],
            'booking_date' => ['sometimes', 'date'],
        ]);

        if (! array_key_exists('status', $validated) && ! array_key_exists('booking_date', $validated)) {
            return $this->errorResponse('No changes provided', 422);
        }

        if (array_key_exists('booking_date', $validated)) {
            $bookingDate = Carbon::parse($validated['booking_date']);

            if ($bookingDate->isPast()) {
                return $this->errorResponse('Schedule must be in the future', 422);
            }

            $scheduler = new BookingScheduler();

            if (! $scheduler->isSlotAvailable($booking->service_id, $bookingDate, $booking->id)) {
                return $this->errorResponse('Selected time slot is not available', 422);
            }

            $validated['booking_date'] = $bookingDate;
        }

        $booking->update($validated);

        return $this->resourceResponse(
            (new BookingResource($booking->fresh()->load(['service', 'user'])))->toArray($request),
            'Booking updated'
        );
    }
}
