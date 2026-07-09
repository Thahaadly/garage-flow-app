<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Service;
use App\Services\BookingScheduler;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BookingController extends Controller
{
    use ApiResponse;

    private const STATUSES = ['scheduled', 'pending', 'pending_payment', 'confirmed', 'completed', 'cancelled'];

    public function __construct(
        private readonly BookingScheduler $scheduler,
    ) {}

    public function index(Request $request)
    {
        $query = Booking::query()
            ->with('service', 'items')
            ->where('user_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $bookings = $query->orderByDesc('booking_date')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10));

        // Use custom resource or paginatedResponse if BookingResource hasn't been updated for new columns
        // For simplicity we will just return it as a resource response
        return $this->paginatedResponse($bookings, BookingResource::class, 'Booking list');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'booking_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $bookingDate = Carbon::parse($validated['booking_date']);

        if ($bookingDate->isPast()) {
            return $this->errorResponse('Schedule must be in the future', 422);
        }

        if (! $this->scheduler->isSlotAvailable($validated['service_id'], $bookingDate)) {
            return $this->errorResponse('Jadwal sudah terisi (double booking) atau di luar jam kerja', 422);
        }

        $service = Service::findOrFail($validated['service_id']);

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'vehicle_id' => $validated['vehicle_id'],
            'service_id' => $validated['service_id'],
            'booking_date' => $bookingDate,
            'status' => 'scheduled',
            'total_price' => 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        return $this->resourceResponse(
            $booking->load('service'),
            'Pemesanan servis berhasil dibuat. Menunggu inspeksi mekanik.',
            201
        );
    }

    public function show(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id && !$request->user()->hasRole(['Admin', 'Mekanik'])) {
            return $this->errorResponse('Not found', 404);
        }

        return $this->resourceResponse(
            $booking->load('service', 'payment'),
            'Booking detail'
        );
    }

    public function update(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id) {
            return $this->errorResponse('Not found', 404);
        }

        $validated = $request->validate([
            'booking_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:' . implode(',', self::STATUSES)],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        if (array_key_exists('booking_date', $validated)) {
            $bookingDate = Carbon::parse($validated['booking_date']);

            if ($bookingDate->isPast()) {
                return $this->errorResponse('Schedule must be in the future', 422);
            }

            if (! $this->scheduler->isSlotAvailable($booking->service_id, $bookingDate, $booking->id)) {
                return $this->errorResponse('Selected time slot is not available', 422);
            }

            $validated['booking_date'] = $bookingDate;
        }

        $booking->update($validated);

        return $this->resourceResponse(
            $booking->fresh()->load('service'),
            'Booking updated'
        );
    }

    public function schedules()
    {
        $validated = request()->validate([
            'service_id' => ['required', 'exists:services,id'],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $date = isset($validated['date'])
            ? Carbon::createFromFormat('Y-m-d', $validated['date'])->startOfDay()
            : Carbon::now()->startOfDay();

        $service = Service::findOrFail($validated['service_id']);
        $slots = $this->scheduler->buildSlots($date, $service);

        return $this->resourceResponse([
            'date' => $date->toDateString(),
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'estimated_duration' => $service->estimated_duration,
            ],
            'slots' => $slots,
        ], 'Schedule slots');
    }

    // --- Role-specific methods below ---

    public function updateStatus(Request $request, Booking $booking)
    {
        // Admin updates status (e.g., from pending_payment to confirmed, etc)
        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', self::STATUSES)],
        ]);

        $booking->update(['status' => $validated['status']]);

        return $this->resourceResponse(
            $booking->fresh()->load('service'),
            'Status pemesanan berhasil diperbarui oleh Admin'
        );
    }

    public function mekanikJobs(Request $request)
    {
        // Mechanic views confirmed/pending jobs
        $jobs = Booking::with('service', 'user')
            ->whereIn('status', ['confirmed', 'completed'])
            ->orderBy('booking_date', 'asc')
            ->get();

        return $this->resourceResponse($jobs, 'Daftar Pekerjaan Mekanik');
    }

    public function updateJobStatus(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:completed'], // mechanic can mark as completed
        ]);

        $booking->update(['status' => $validated['status']]);

        return $this->resourceResponse(
            $booking->fresh()->load('service'),
            'Pekerjaan berhasil diselesaikan'
        );
    }

    public function allBookings(Request $request)
    {
        // Shared between Admin and Mekanik
        $bookings = Booking::with('service', 'user')->orderBy('booking_date', 'desc')->paginate(20);
        return $this->resourceResponse($bookings, 'Semua pemesanan servis');
    }
}
