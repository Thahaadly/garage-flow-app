<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'vehicle_id' => $this->vehicle_id,
            'service_id' => $this->service_id,
            'booking_date' => $this->booking_date?->toDateTimeString(),
            'status' => $this->status,
            'total_price' => (string) $this->total_price,
            'notes' => $this->notes,
            'user' => $this->relationLoaded('user') && $this->user ? new UserResource($this->user) : new \Illuminate\Http\Resources\MissingValue(),
            'vehicle' => $this->relationLoaded('vehicle') && $this->vehicle ? new VehicleResource($this->vehicle) : new \Illuminate\Http\Resources\MissingValue(),
            'service' => $this->relationLoaded('service') && $this->service ? new ServiceResource($this->service) : new \Illuminate\Http\Resources\MissingValue(),
            'payment' => $this->whenLoaded('payment'),
            'items' => $this->whenLoaded('items'),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
