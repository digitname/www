# Portfolio Management System

This module provides a complete portfolio management system for the Digitname application, allowing you to showcase your projects, work samples, and case studies.

## Features

- Create, read, update, and delete portfolio items
- Support for featured items and categories
- Image upload and management
- Technology tags for projects
- API endpoints for frontend integration
- Caching for improved performance
- File storage configuration (local, S3, etc.)

## Requirements

- PHP 8.1 or higher
- Laravel 10.x
- MySQL 8.0 or higher
- Composer
- Node.js & NPM (for frontend assets)

## Installation

1. Install the package via Composer:

```bash
composer require digitname/portfolio
```

2. Publish the configuration file:

```bash
php artisan vendor:publish --tag=portfolio-config
```

3. Run migrations:

```bash
php artisan migrate
```

4. (Optional) Publish the frontend assets:

```bash
php artisan vendor:publish --tag=portfolio-assets
```

## Configuration

Edit the `config/portfolio.php` file to customize the portfolio settings:

```php
return [
    'enabled' => env('PORTFOLIO_ENABLED', true),
    'items_per_page' => env('PORTFOLIO_ITEMS_PER_PAGE', 12),
    'storage' => [
        'disk' => env('PORTFOLIO_STORAGE_DISK', 'public'),
        'path' => 'portfolio',
        'image' => [
            'max_size' => env('PORTFOLIO_IMAGE_MAX_SIZE', 5120), // in KB
            'allowed_extensions' => explode(',', env('PORTFOLIO_ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp')),
        ],
    ],
];
```

## API Endpoints

### List Portfolio Items

```
GET /api/portfolio
```

### Get Single Portfolio Item

```
GET /api/portfolio/{id}
```

### Create Portfolio Item (Requires Authentication)

```
POST /api/portfolio
```

### Update Portfolio Item (Requires Authentication)

```
PUT /api/portfolio/{id}
```

### Delete Portfolio Item (Requires Authentication)

```
DELETE /api/portfolio/{id}
```

## Frontend Integration

You can use the portfolio API with any frontend framework. Here's an example using Axios:

```javascript
// Get all portfolio items
const response = await axios.get('/api/portfolio');
const items = response.data.data;

// Get a single portfolio item
const itemResponse = await axios.get(`/api/portfolio/${itemId}`);
const item = itemResponse.data.data;
```

## Security

- All write operations require authentication
- File uploads are validated for type and size
- SQL injection protection is handled by Laravel's Eloquent ORM
- CSRF protection is enabled for all forms

## Testing

Run the tests with:

```bash
php artisan test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
