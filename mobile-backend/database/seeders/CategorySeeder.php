<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Oli & Pelumas',
            'Rem',
            'Aki & Kelistrikan',
            'Filter',
            'Ban & Velg',
            'Suspensi',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
