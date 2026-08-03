<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatTest extends TestCase
{
    public function test_can_ask_chatbot_successfully(): void
    {
        config(['services.gemini.api_key' => 'dummy-api-key']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Halo Sobat GarageFlow! Masalah rem bunyi itu biasanya karena kampas rem sudah tipis 🚗.']
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->postJson('/api/chat', [
            'message' => 'Mobil saya remnya bunyi pas diinjak, kenapa ya?'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('meta.status', 'success')
            ->assertJsonPath('data.reply', 'Halo Sobat GarageFlow! Masalah rem bunyi itu biasanya karena kampas rem sudah tipis 🚗.');
    }

    public function test_chat_validation_requires_message(): void
    {
        $response = $this->postJson('/api/chat', []);

        $response->assertStatus(422)
            ->assertJsonPath('data.errors.message.0', 'The message field is required.');
    }

    public function test_chat_fails_when_api_key_not_set(): void
    {
        config(['services.gemini.api_key' => null]);

        $response = $this->postJson('/api/chat', [
            'message' => 'Tes tanpa API Key'
        ]);

        $response->assertStatus(500)
            ->assertJsonPath('meta.status', 'error')
            ->assertJsonPath('meta.message', 'API key belum diset. Mohon konfigurasi GEMINI_API_KEY.');
    }

    public function test_chat_handles_rate_limit_gracefully(): void
    {
        config(['services.gemini.api_key' => 'dummy-api-key']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([], 429)
        ]);

        $response = $this->postJson('/api/chat', [
            'message' => 'Tes rate limit'
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('meta.status', 'error')
            ->assertJsonPath('meta.message', 'AI sedang sibuk atau mengalami antrean. Coba lagi sebentar ya.');
    }
}
