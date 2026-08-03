<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Spatie\Permission\Models\Role::create(['name' => 'Customer', 'guard_name' => 'web']);
    }

    private function registerPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
            'address' => 'Jl. Testing No. 1',
        ], $overrides);
    }

    // ─── Registration ────────────────────────────────────────────────

    public function test_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/register', $this->registerPayload());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'meta' => ['code', 'status', 'message'],
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email', 'phone', 'address'],
                ],
            ])
            ->assertJsonPath('meta.status', 'success');

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_register_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/register', $this->registerPayload());

        $response->assertStatus(422);

        // Verify the response mentions the email field in some form
        $content = $response->getContent();
        $this->assertStringContainsString('email', $content);
    }

    // ─── Login ───────────────────────────────────────────────────────

    public function test_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'meta' => ['code', 'status', 'message'],
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email'],
                ],
            ])
            ->assertJsonPath('meta.status', 'success');
    }

    public function test_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('meta.status', 'error');
    }

    // ─── Logout ──────────────────────────────────────────────────────

    public function test_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('mobile')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success');

        // Token should be revoked
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    // ─── Profile ─────────────────────────────────────────────────────

    public function test_get_profile(): void
    {
        $user = User::factory()->create(['name' => 'John Doe']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'Updated Name',
                'phone' => '089876543210',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.phone', '089876543210');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }
}
