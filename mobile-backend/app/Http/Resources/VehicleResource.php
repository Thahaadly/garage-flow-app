<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'brand' => $this->brand,
            'model' => $this->model,
            'year' => $this->year,
            'license_plate' => $this->license_plate,
            'color' => $this->color,
            'mileage' => $this->mileage,
            'fuel_type' => $this->fuel_type,
            'image_url' => $this->image_url,
            'last_service_mileage' => $this->last_service_mileage,
            'last_service_date' => $this->last_service_date,
            'battery_health' => $this->battery_health,
            'tire_condition' => $this->tire_condition,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
