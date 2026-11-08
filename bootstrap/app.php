<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Every "not found" answer to a JSON client gets the same body. Laravel's own
        // message for a missing model names the model and the id, which would
        // allow a caller to tell 'no such chat' from 'not your chat'.
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 404 && $request->expectsJson()) {
                return response()->json([
                    'message' => 'Not found',
                ], 404);
            }

            // Allow Laravel to handle other exceptions normally
            return null;
        });

                // JSON calls keep their real status and body: the chat shows its own messages.
        // Page visits get a friendly page for common errors, and a redirect instead
        // of Inertia's raw error modal when a token expired (419).
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($request->expectsJson()) {
                return $response;
            }

            $status = $response->getStatusCode();

            // Only with debug off, so Laravel's detailed error page is still there while developing.
            if (! config('app.debug') && in_array($status, [403, 404, 500, 503], true)) {
                return Inertia::render('error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            if ($status === 419) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Your session expired. Please try again.',
                ]);

                return back();
            }

            return $response;
        });

        // Original JSON exception handling
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();