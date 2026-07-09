<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(HandleCors::class);
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (ValidationException $exception, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'meta' => [
                    'code' => 422,
                    'status' => 'error',
                    'message' => $exception->getMessage() ?: 'Validation error',
                ],
                'data' => [
                    'errors' => $exception->errors(),
                ],
            ], 422);
        });

        $exceptions->renderable(function (AuthenticationException $exception, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'meta' => [
                    'code' => 401,
                    'status' => 'error',
                    'message' => $exception->getMessage() ?: 'Unauthenticated',
                ],
                'data' => (object) [],
            ], 401);
        });

        $exceptions->renderable(function (HttpExceptionInterface $exception, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = $exception->getStatusCode();
            $message = $exception->getMessage();

            if ($message === '') {
                $message = $status === 404 ? 'Not found' : 'Request error';
            }

            return response()->json([
                'meta' => [
                    'code' => $status,
                    'status' => 'error',
                    'message' => $message,
                ],
                'data' => (object) [],
            ], $status);
        });

        $exceptions->renderable(function (\Throwable $exception, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'meta' => [
                    'code' => 500,
                    'status' => 'error',
                    'message' => 'Server error',
                ],
                'data' => (object) [],
            ], 500);
        });
    })->create();
