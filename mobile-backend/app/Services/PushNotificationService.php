<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Send an Expo push notification.
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param array $data
     * @return bool
     */
    public static function send(User $user, string $title, string $body, array $data = []): bool
    {
        $token = $user->expo_push_token;

        if (!$token) {
            return false;
        }

        try {
            $response = Http::post('https://exp.host/--/api/v2/push/send', [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Expo Push Notification Failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Expo Push Notification Exception: ' . $e->getMessage());
        }

        return false;
    }
}
