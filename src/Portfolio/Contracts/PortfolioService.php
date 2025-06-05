<?php

namespace App\Portfolio\Contracts;

use Illuminate\Http\UploadedFile;

interface PortfolioService
{
    /**
     * Get all portfolio items with pagination
     */
    public function getAllItems(int $perPage = null);

    /**
     * Get a single portfolio item by ID or slug
     */
    public function getItem($identifier);

    /**
     * Create a new portfolio item
     */
    public function createItem(array $data, ?UploadedFile $image = null);

    /**
     * Update an existing portfolio item
     */
    public function updateItem($id, array $data, ?UploadedFile $image = null): bool;

    /**
     * Delete a portfolio item
     */
    public function deleteItem($id): bool;
}
