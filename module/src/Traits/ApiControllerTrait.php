<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Traits;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

trait ApiControllerTrait {
    protected static $default_headers = [
        "Content-Type" => "application/json",
    ];

    /**
     * @param  array|string $message
     * @param  int    $status
     * @param  array  $headers
     */
    protected function sendResponse($message, $status = Response::HTTP_OK, array $headers = [])
    {
        (new JsonResponse(
            $message,
            $status,
            array_merge(self::$default_headers, $headers)
        ))->send();
        exit;
    }
}