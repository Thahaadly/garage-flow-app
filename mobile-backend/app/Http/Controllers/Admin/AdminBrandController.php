<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Http\Responses\ApiResponse;
use App\Models\Brand;
use Illuminate\Http\Request;

class AdminBrandController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->collectionResponse(
            Brand::query()->orderBy('name')->get(),
            BrandResource::class,
            'Brand list'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:brands,name'],
        ]);

        $brand = Brand::create($validated);

        return $this->resourceResponse(
            (new BrandResource($brand))->toArray($request),
            'Brand created',
            201
        );
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120', 'unique:brands,name,' . $brand->id],
        ]);

        $brand->update($validated);

        return $this->resourceResponse(
            (new BrandResource($brand->fresh()))->toArray($request),
            'Brand updated'
        );
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        return $this->successResponse((object) [], 'Brand deleted');
    }
}
