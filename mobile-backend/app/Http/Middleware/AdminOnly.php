<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || !$user->hasRole('Admin')) {
            return response()->json([
                'meta' => [
                    'code' => 403,
                    'status' => 'error',
                    'message' => 'Forbidden',
                ],
                'data' => (object) [],
            ], 403);
        }

        return $next($request);
    }
}
