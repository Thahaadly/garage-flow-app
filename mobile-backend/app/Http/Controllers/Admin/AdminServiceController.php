<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Service;
use Illuminate\Http\Request;

class AdminServiceController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->collectionResponse(
            Service::query()->orderBy('name')->get(),
            ServiceResource::class,
            'Service list'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160', 'unique:services,name'],
            'estimated_duration' => ['required', 'integer', 'min:1'],
            'estimated_price' => ['required', 'numeric', 'min:0'],
        ]);

        $service = Service::create($validated);

        return $this->resourceResponse(
            (new ServiceResource($service))->toArray($request),
            'Service created',
            201
        );
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:160', 'unique:services,name,' . $service->id],
            'estimated_duration' => ['sometimes', 'integer', 'min:1'],
            'estimated_price' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $service->update($validated);

        return $this->resourceResponse(
            (new ServiceResource($service->fresh()))->toArray($request),
            'Service updated'
        );
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return $this->successResponse((object) [], 'Service deleted');
    }
}
