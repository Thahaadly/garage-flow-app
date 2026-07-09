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
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'vehicle' => $this->whenLoaded('vehicle', fn() => new VehicleResource($this->vehicle)),
            'service' => $this->whenLoaded('service', fn() => new ServiceResource($this->service)),
            'payment' => $this->whenLoaded('payment'),
            'items' => $this->whenLoaded('items'),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
