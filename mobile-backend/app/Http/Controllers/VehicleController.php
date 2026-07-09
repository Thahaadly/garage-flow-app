<?php

namespace App\Http\Controllers;

use App\Http\Resources\VehicleResource;
use App\Http\Responses\ApiResponse;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $vehicles = Vehicle::where('user_id', $request->user()->id)->get();
        return $this->collectionResponse($vehicles, VehicleResource::class, 'Vehicle list');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'license_plate' => ['required', 'string', 'max:20', 'unique:vehicles'],
            'color' => ['nullable', 'string', 'max:50'],
            'mileage' => ['required', 'integer', 'min:0'],
            'fuel_type' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'url'],
        ]);

        $validated['last_service_mileage'] = $validated['mileage'];

        $vehicle = $request->user()->vehicles()->create($validated);

        return $this->resourceResponse(new VehicleResource($vehicle), 'Vehicle created', 201);
    }

    public function show(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            return $this->errorResponse('Not found', 404);
        }

        return $this->resourceResponse(new VehicleResource($vehicle), 'Vehicle detail');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            return $this->errorResponse('Not found', 404);
        }

        $validated = $request->validate([
            'brand' => ['sometimes', 'string', 'max:255'],
            'model' => ['sometimes', 'string', 'max:255'],
            'year' => ['sometimes', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'license_plate' => ['sometimes', 'string', 'max:20', 'unique:vehicles,license_plate,' . $vehicle->id],
            'color' => ['nullable', 'string', 'max:50'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'fuel_type' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'url'],
        ]);

        $vehicle->update($validated);

        return $this->resourceResponse(new VehicleResource($vehicle), 'Vehicle updated');
    }

    public function destroy(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            return $this->errorResponse('Not found', 404);
        }

        $vehicle->delete();

        return $this->successResponse(null, 'Vehicle deleted');
    }
}
