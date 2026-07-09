<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::create(['name' => 'Admin']);
        $mekanikRole = Role::create(['name' => 'Mekanik']);
        $customerRole = Role::create(['name' => 'Customer']);

        // Create Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);

        // Create Mekanik
        $mekanik = User::firstOrCreate(
            ['email' => 'mekanik@example.com'],
            [
                'name' => 'Mekanik Ahli',
                'password' => Hash::make('password'),
            ]
        );
        $mekanik->assignRole($mekanikRole);

        // Create Customer
        $customer = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('password'),
            ]
        );
        $customer->assignRole($customerRole);
    }
}
