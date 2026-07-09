<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->integer('last_service_mileage')->default(0)->after('mileage');
            $table->date('last_service_date')->nullable()->after('last_service_mileage');
            $table->string('battery_health')->default('Good')->after('last_service_date');
            $table->integer('tire_condition')->default(100)->after('battery_health');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['last_service_mileage', 'last_service_date', 'battery_health', 'tire_condition']);
        });
    }
};
