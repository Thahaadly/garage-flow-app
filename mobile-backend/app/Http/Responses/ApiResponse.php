<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

trait ApiResponse
{
    protected function successResponse(mixed $data, string $message = 'OK', int $code = 200, ?array $pagination = null)
    {
        $payload = [
            'meta' => [
                'code' => $code,
                'status' => 'success',
                'message' => $message,
            ],
            'data' => $data,
        ];

        if ($pagination !== null) {
            $payload['pagination'] = $pagination;
        }

        return response()->json($payload, $code);
    }

    protected function errorResponse(string $message, int $code = 400, mixed $data = null)
    {
        return response()->json([
            'meta' => [
                'code' => $code,
                'status' => 'error',
                'message' => $message,
            ],
            'data' => $data ?? (object) [],
        ], $code);
    }

    protected function resourceResponse(mixed $resource, string $message = 'OK', int $code = 200)
    {
        return $this->successResponse($resource, $message, $code);
    }

    protected function collectionResponse(Collection $items, string $resourceClass, string $message = 'OK', int $code = 200)
    {
        $data = $items->map(function ($item) use ($resourceClass) {
            return (new $resourceClass($item))->resolve(request());
        })->values()->all();

        return $this->successResponse($data, $message, $code);
    }

    protected function paginatedResponse(LengthAwarePaginator $paginator, string $resourceClass, string $message = 'OK', int $code = 200)
    {
        $data = $paginator->getCollection()->map(function ($item) use ($resourceClass) {
            return (new $resourceClass($item))->resolve(request());
        })->values()->all();

        $pagination = [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'path' => $paginator->path(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
        ];

        return $this->successResponse($data, $message, $code, $pagination);
    }
}
