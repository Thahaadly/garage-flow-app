<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'models/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://localhost:8080,http://localhost:5173,http://localhost:8081,http://127.0.0.1:3000,http://127.0.0.1:8080,http://127.0.0.1:5173,http://127.0.0.1:8081',
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
