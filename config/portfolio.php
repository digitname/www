<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Portfolio Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration options for the portfolio functionality.
    | You can customize these values based on your application's requirements.
    |
    */


    /*
    |--------------------------------------------------------------------------
    | Portfolio Features
    |--------------------------------------------------------------------------
    |
    | Enable or disable various portfolio features.
    |
    */
    'enabled' => env('PORTFOLIO_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Items Per Page
    |--------------------------------------------------------------------------
    |
    | The number of portfolio items to show per page in the listing.
    |
    */
    'items_per_page' => env('PORTFOLIO_ITEMS_PER_PAGE', 12),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the caching behavior for portfolio items.
    |
    */
    'cache' => [
        'enabled' => env('CACHE_ENABLED', true),
        'ttl' => env('PORTFOLIO_CACHE_TTL', 3600), // in seconds
        'key_prefix' => 'portfolio_',
    ],

    /*
    |--------------------------------------------------------------------------
    | Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configure where portfolio images and other files should be stored.
    |
    */
    'storage' => [
        'disk' => env('PORTFOLIO_STORAGE_DISK', 'public'),
        'path' => 'portfolio',
        'image' => [
            'max_size' => env('PORTFOLIO_IMAGE_MAX_SIZE', 5120), // in KB
            'allowed_extensions' => explode(',', env('PORTFOLIO_ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp')),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the API endpoints and behavior.
    |
    */
    'api' => [
        'prefix' => 'api/portfolio',
        'middleware' => ['api'],
        'throttle' => [
            'enabled' => true,
            'max_attempts' => 60,
            'decay_minutes' => 1,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Values
    |--------------------------------------------------------------------------
    |
    | Default values for new portfolio items.
    |
    */
    'defaults' => [
        'is_featured' => false,
        'technologies' => [],
    ],
];
