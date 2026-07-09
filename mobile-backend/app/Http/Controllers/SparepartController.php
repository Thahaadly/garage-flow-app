<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SparepartResource;
use App\Http\Responses\ApiResponse;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use Illuminate\Http\Request;

class SparepartController extends Controller
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

    public function show(Sparepart $sparepart)
    {
        return $this->resourceResponse(
            (new SparepartResource($sparepart->load(['category', 'brand'])))->toArray(request()),
            'Sparepart detail'
        );
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => ['required', 'string', 'min:1'],
        ]);

        $query = Sparepart::query()->with(['category', 'brand']);
        $query->where('name', 'like', '%' . $request->string('q') . '%');

        $spareparts = $query->orderBy('name')->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($spareparts, SparepartResource::class, 'Sparepart search results');
    }

    public function categories()
    {
        return $this->collectionResponse(
            Category::query()->orderBy('name')->get(),
            CategoryResource::class,
            'Category list'
        );
    }

    public function brands()
    {
        return $this->collectionResponse(
            Brand::query()->orderBy('name')->get(),
            BrandResource::class,
            'Brand list'
        );
    }
}
