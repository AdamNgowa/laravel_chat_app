<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * How often one person may use the chat endpoints. Each limit is counted
     * per signed-in user (by IP address if there somehow is none), and over the
     * limit the server answers 429 Too Many Requests with a Retry-After header.
     */
    protected function configureRateLimiting(): void
    {
        // Sending messages: a fast typist is nowhere near 30 a minute.
        RateLimiter::for('messages', fn (Request $request) => Limit::perMinute(30)->by($this->limitKey($request)));

        // The new-chat search asks once per pause in typing.
        RateLimiter::for('user-search', fn (Request $request) => Limit::perMinute(60)->by($this->limitKey($request)));

        // Starting or opening a chat with someone.
        RateLimiter::for('start-chat', fn (Request $request) => Limit::perMinute(20)->by($this->limitKey($request)));
    }

    private function limitKey(Request $request): string
    {
        return (string) ($request->user()?->id ?: $request->ip());
    }
}