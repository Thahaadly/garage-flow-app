<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'max:25'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create($validated);
        $user->assignRole('Customer');
        $token = $user->createToken('mobile')->plainTextToken;

        return $this->resourceResponse([
            'token' => $token,
            'user' => (new UserResource($user))->toArray($request),
        ], 'Registration successful', 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return $this->resourceResponse([
            'token' => $token,
            'user' => (new UserResource($user))->toArray($request),
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse((object) [], 'Logged out');
    }

    public function profile(Request $request)
    {
        return $this->resourceResponse(
            (new UserResource($request->user()))->toArray($request),
            'Profile detail'
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:120', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'confirmed', Password::min(8)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:25'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'expo_push_token' => ['sometimes', 'nullable', 'string'],
        ]);

        $user->update($validated);

        return $this->resourceResponse(
            (new UserResource($user->fresh()))->toArray($request),
            'Profile updated'
        );
    }
}
