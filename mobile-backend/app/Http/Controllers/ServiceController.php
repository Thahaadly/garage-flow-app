<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

class ServiceController extends Controller
{
    use ApiResponse;

    // Public / Customer can view all services
    public function index()
    {
        $services = Service::orderBy('name')->get();
        
        return $this->resourceResponse(
            $services,
            'Daftar layanan berhasil diambil'
        );
    }

    // Admin only
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:160',
            'description' => 'nullable|string',
            'estimated_duration' => 'required|integer|min:1',
            'estimated_price' => 'required|numeric|min:0',
        ]);

        $service = Service::create($validated);

        return $this->resourceResponse(
            $service,
            'Layanan berhasil dibuat',
            201
        );
    }

    // Admin only
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:160',
            'description' => 'nullable|string',
            'estimated_duration' => 'sometimes|required|integer|min:1',
            'estimated_price' => 'sometimes|required|numeric|min:0',
        ]);

        $service->update($validated);

        return $this->resourceResponse(
            $service->fresh(),
            'Layanan berhasil diperbarui'
        );
    }

    // Admin only
    public function destroy(Service $service)
    {
        $service->delete();

        return $this->resourceResponse(
            null,
            'Layanan berhasil dihapus'
        );
    }
}
