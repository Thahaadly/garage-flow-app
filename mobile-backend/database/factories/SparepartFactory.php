<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sparepart>
 */
class SparepartFactory extends Factory
{
    protected $model = Sparepart::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'image_url' => null,
            'price' => fake()->numberBetween(10000, 500000),
            'stock' => fake()->numberBetween(0, 100),
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
        ];
    }
}
