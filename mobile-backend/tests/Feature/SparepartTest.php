<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SparepartTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    private Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::factory()->create(['name' => 'Oli & Pelumas']);
        $this->brand = Brand::factory()->create(['name' => 'Honda']);
    }

    // ─── Index ───────────────────────────────────────────────────────

    public function test_list_spareparts(): void
    {
        Sparepart::factory()->count(5)->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        $response = $this->getJson('/api/spareparts');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'meta' => ['code', 'status', 'message'],
                'data' => [
                    '*' => ['id', 'name', 'price', 'stock'],
                ],
                'pagination',
            ]);
    }

    // ─── Search ──────────────────────────────────────────────────────

    public function test_search_spareparts(): void
    {
        Sparepart::factory()->create([
            'name' => 'Oli Mesin 10W-40',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        Sparepart::factory()->create([
            'name' => 'Kampas Rem Depan',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        $response = $this->getJson('/api/spareparts/search?q=Oli');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Oli Mesin 10W-40');
    }

    // ─── Show ────────────────────────────────────────────────────────

    public function test_show_single_sparepart(): void
    {
        $sparepart = Sparepart::factory()->create([
            'name' => 'Filter Udara',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        $response = $this->getJson("/api/spareparts/{$sparepart->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.id', $sparepart->id)
            ->assertJsonPath('data.name', 'Filter Udara');
    }

    // ─── Categories & Brands ─────────────────────────────────────────

    public function test_list_categories(): void
    {
        // setUp already created one category
        Category::factory()->create(['name' => 'Rem']);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(2, 'data');
    }

    public function test_list_brands(): void
    {
        // setUp already created one brand
        Brand::factory()->create(['name' => 'Yamaha']);

        $response = $this->getJson('/api/brands');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonCount(2, 'data');
    }
}
