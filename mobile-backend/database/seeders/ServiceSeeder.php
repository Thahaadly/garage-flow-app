<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Servis Ringan', 
                'description' => "Servis ringan umumnya dilakukan secara rutin setiap kelipatan jarak tempuh tertentu (misalnya setiap 5.000 km atau 10.000 km) untuk menjaga performa harian.\n\nCakupannya meliputi:\n• Penggantian Rutin: Mengganti oli mesin dan filter oli.\n• Filter & Cairan: Pembersihan/penggantian filter udara dan filter AC, serta pengecekan air radiator, minyak rem, dan oli transmisi.\n• Pengecekan Kaki-kaki: Pemeriksaan tekanan angin ban, kondisi kampas rem, dan rotasi ban.\n• Sistem Kelistrikan: Pengecekan aki dan lampu-lampu.",
                'estimated_duration' => 60, 
                'estimated_price' => 0
            ],
            [
                'name' => 'Servis Sedang', 
                'description' => "Servis sedang atau tune-up dilakukan untuk mengembalikan dan menjaga performa mesin agar tetap optimal. Biasanya dilakukan pada periode tertentu (misal: setiap 20.000 km hingga 40.000 km).\n\nCakupannya meliputi:\n• Pembersihan ruang bakar dan injektor (injector cleaner).\n• Penggantian busi jika sudah aus.\n• Pengecekan sistem pengapian.\n• Servis dan pembersihan sistem pengereman (kampas rem depan dan belakang).\n• Spooring dan balancing untuk penyelarasan roda dan kaki-kaki.",
                'estimated_duration' => 120, 
                'estimated_price' => 0
            ],
            [
                'name' => 'Servis Berat', 
                'description' => "Servis berat merupakan perbaikan besar pada komponen internal kendaraan ketika terjadi kerusakan parah, penurunan performa drastis, atau penggantian suku cadang vital.\n\nCakupannya meliputi:\n• Overhaul atau turun mesin (setengah maupun total). Dilakukan jika ada masalah pada piston, blok mesin, atau kepala silinder.\n• Turun transmisi untuk memperbaiki masalah kopling atau girboks.\n• Penggantian komponen utama seperti timing belt.\n• Perbaikan total sistem rem (termasuk mengganti master rem atau cakram yang aus).",
                'estimated_duration' => 300, 
                'estimated_price' => 0
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                [
                    'description' => $service['description'],
                    'estimated_duration' => $service['estimated_duration'], 
                    'estimated_price' => $service['estimated_price']
                ]
            );
        }
    }
}
