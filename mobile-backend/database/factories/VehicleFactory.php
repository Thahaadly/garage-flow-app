<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'brand' => fake()->randomElement(['Toyota', 'Honda', 'Yamaha', 'Suzuki']),
            'model' => fake()->word(),
            'year' => fake()->numberBetween(2010, 2024),
            'license_plate' => fake()->unique()->bothify('? #### ??'),
            'color' => fake()->colorName(),
            'mileage' => fake()->numberBetween(0, 100000),
        ];
    }
}
