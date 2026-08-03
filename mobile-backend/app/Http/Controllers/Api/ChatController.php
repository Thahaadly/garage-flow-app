<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    use ApiResponse;

    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        try {
            $userMessage = $request->input('message');
            $apiKey = config('services.gemini.api_key');

            if (! $apiKey) {
                return $this->errorResponse('API key belum diset. Mohon konfigurasi GEMINI_API_KEY.', 500);
            }

            // Ini adalah "Instruksi Sistem" atau "System Prompt".
            // Kita kunci karakternya di sini agar tidak keluar konteks.
            // Instruksi Sistem (Persona Montir yang Ramah & Proaktif)
            $systemPrompt = "Kamu adalah 'Montir AI', mekanik senior andalan di bengkel GarageFlow. Gaya bahasamu ramah, asyik, dan suportif layaknya montir langganan. Gunakan sapaan 'Halo Sobat GarageFlow!' atau sapaan akrab lainnya. 

Ikuti 4 ATURAN WAJIB ini:
1. GALI INFORMASI: Jika pertanyaan pelanggan terlalu singkat atau tidak jelas (misalnya: 'mobil bunyi', 'AC panas'), JANGAN langsung memberikan analisis panjang. Balaslah dengan empati dan ajukan 1-2 pertanyaan panduan (misal: 'Bunyinya pas lagi ngebut atau pas baru distarter nih, Bos?', atau 'Boleh tahu tipe mobil dan tahunnya?').
2. BAHASA AWAM: Jelaskan masalah teknis (seperti urusan engine mounting atau masalah kopling) menggunakan perumpamaan yang mudah dipahami orang awam. 
3. FORMAT RAPI: Gunakan poin-poin (bullet points), tebalkan (bold) nama komponen penting, dan gunakan sedikit emoji (seperti 🔧, 🚗, atau 💡) agar teks tidak kaku.
4. FOKUS: Tolak dengan halus dan lucu jika ditanya hal di luar dunia otomotif.

Berikut adalah pertanyaan atau keluhan pelanggan: ";

            $fullPrompt = $systemPrompt . $userMessage;

            // Pastikan tidak ada spasi gaib di API Key
            $cleanApiKey = trim($apiKey);

            // Build HTTP client — disable SSL verification only in local/dev
            $http = Http::withHeaders([
                'Content-Type' => 'application/json',
            ]);

            if (config('app.env') !== 'production') {
                $http = $http->withoutVerifying();
            }

            // Kita gunakan v1beta dan model 'gemini-flash-latest' yang RESMI ada di daftarmu
            $response = $http->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $cleanApiKey, [
                'contents' => [
                    ['parts' => [['text' => $fullPrompt]]]
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error: ' . $e->getMessage(), 500);
        }

        if ($response->successful()) {
            // Mengambil teks balasan dari struktur JSON Gemini
            $aiReply = $response->json('candidates.0.content.parts.0.text');

            return $this->successResponse(['reply' => $aiReply], 'AI response generated successfully.');
        }
        
        if ($response->status() === 429 || $response->status() === 503) {
            return $this->errorResponse('AI sedang sibuk atau mengalami antrean. Coba lagi sebentar ya.', $response->status(), ['reply' => 'AI sedang sibuk atau mengalami antrean. Coba lagi sebentar ya.']);
        }

        return $this->errorResponse('Terjadi kesalahan pada layanan AI. Mohon coba lagi.', 500, ['reply' => 'Terjadi kesalahan pada layanan AI. Mohon coba lagi.']);
    }
}