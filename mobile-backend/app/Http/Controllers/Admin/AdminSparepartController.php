<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SparepartResource;
use App\Http\Responses\ApiResponse;
use App\Models\Sparepart;
use Illuminate\Http\Request;

class AdminSparepartController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Sparepart::query()->with(['category', 'brand']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->integer('brand_id'));
        }

        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->string('q') . '%');
        }

        $spareparts = $query->orderBy('name')->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($spareparts, SparepartResource::class, 'Sparepart list');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['required', 'exists:brands,id'],
        ]);

        $sparepart = Sparepart::create($validated);

        return $this->resourceResponse(
            (new SparepartResource($sparepart->load(['category', 'brand'])))->toArray($request),
            'Sparepart created',
            201
        );
    }

    public function update(Request $request, Sparepart $sparepart)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'exists:brands,id'],
        ]);

        $sparepart->update($validated);

        return $this->resourceResponse(
            (new SparepartResource($sparepart->fresh()->load(['category', 'brand'])))->toArray($request),
            'Sparepart updated'
        );
    }

    public function destroy(Sparepart $sparepart)
    {
        $sparepart->delete();

        return $this->successResponse((object) [], 'Sparepart deleted');
    }
}
