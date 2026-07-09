<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Responses\ApiResponse;
use App\Models\Category;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->collectionResponse(
            Category::query()->orderBy('name')->get(),
            CategoryResource::class,
            'Category list'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:categories,name'],
        ]);

        $category = Category::create($validated);

        return $this->resourceResponse(
            (new CategoryResource($category))->toArray($request),
            'Category created',
            201
        );
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120', 'unique:categories,name,' . $category->id],
        ]);

        $category->update($validated);

        return $this->resourceResponse(
            (new CategoryResource($category->fresh()))->toArray($request),
            'Category updated'
        );
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return $this->successResponse((object) [], 'Category deleted');
    }
}
