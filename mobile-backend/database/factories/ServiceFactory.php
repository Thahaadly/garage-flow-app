<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'estimated_duration' => fake()->randomElement([30, 45, 60]),
            'estimated_price' => fake()->numberBetween(50000, 300000),
        ];
    }
}
