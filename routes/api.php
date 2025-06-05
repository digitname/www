<?php

use Illuminate\Support\Facades\Route;
use App\Portfolio\Controllers\PortfolioController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Portfolio API Routes
Route::prefix('portfolio')->group(function () {
    // Public routes
    Route::get('/', [PortfolioController::class, 'index']);
    Route::get('/{id}', [PortfolioController::class, 'show']);

    // Protected routes (require authentication)
    Route::middleware(['auth:api'])->group(function () {
        Route::post('/', [PortfolioController::class, 'store']);
        Route::put('/{id}', [PortfolioController::class, 'update']);
        Route::delete('/{id}', [PortfolioController::class, 'destroy']);
    });
});
