<?php

namespace App\Portfolio;

use Illuminate\Support\ServiceProvider;
use App\Portfolio\Services\PortfolioService;
use App\Portfolio\Contracts\PortfolioService as PortfolioServiceContract;

class PortfolioServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Merge configuration
        $this->mergeConfigFrom(
            __DIR__.'/../../config/portfolio.php', 'portfolio'
        );

        // Bind PortfolioService to the service container
        $this->app->singleton(PortfolioServiceContract::class, function ($app) {
            return new PortfolioService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration
        $this->publishes([
            __DIR__.'/../../config/portfolio.php' => config_path('portfolio.php'),
        ], 'config');

        // Load migrations
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');

        // Load routes
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
    }
}
