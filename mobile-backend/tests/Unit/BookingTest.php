<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class BookingTest extends TestCase
{
    public function test_it_has_expected_fillable_attributes(): void
    {
        $booking = new \App\Models\Booking();
        
        $expected = [
            'user_id',
            'vehicle_id',
            'service_id',
            'booking_date',
            'status',
            'total_price',
            'notes',
        ];

        $this->assertEquals($expected, $booking->getFillable());
    }
}
