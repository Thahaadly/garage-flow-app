<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use Illuminate\Database\Seeder;

class SparepartSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Oli Mesin 10W-40',
                'category' => 'Oli & Pelumas',
                'brand' => 'Honda',
                'price' => 65000,
                'stock' => 40,
                'description' => 'Oli mesin semi-sintetik untuk motor harian.',
            ],
            [
                'name' => 'Kampas Rem Depan',
                'category' => 'Rem',
                'brand' => 'Yamaha',
                'price' => 85000,
                'stock' => 25,
                'description' => 'Kampas rem depan dengan daya cengkram tinggi.',
            ],
            [
                'name' => 'Aki MF 12V 5Ah',
                'category' => 'Aki & Kelistrikan',
                'brand' => 'GS Astra',
                'price' => 210000,
                'stock' => 15,
                'description' => 'Aki bebas perawatan untuk motor matic.',
            ],
            [
                'name' => 'Filter Udara',
                'category' => 'Filter',
                'brand' => 'Toyota',
                'price' => 120000,
                'stock' => 20,
                'description' => 'Filter udara mesin untuk mobil harian.',
            ],
            [
                'name' => 'Busi Iridium',
                'category' => 'Aki & Kelistrikan',
                'brand' => 'NGK',
                'price' => 110000,
                'stock' => 35,
                'description' => 'Busi iridium dengan pembakaran stabil.',
            ],
        ];

        foreach ($items as $item) {
            $category = Category::firstOrCreate(['name' => $item['category']]);
            $brand = Brand::firstOrCreate(['name' => $item['brand']]);

            Sparepart::firstOrCreate(
                ['name' => $item['name']],
                [
                    'description' => $item['description'],
                    'image_url' => $item['image_url'] ?? null,
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                ]
            );
        }
    }
}
