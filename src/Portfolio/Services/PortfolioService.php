<?php

namespace App\Portfolio\Services;

use App\Portfolio\Models\PortfolioItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioService
{
    /**
     * Get all portfolio items with pagination
     */
    public function getAllItems(int $perPage = null)
    {
        $perPage = $perPage ?: config('portfolio.items_per_page', 12);
        return PortfolioItem::published()
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get a single portfolio item by ID or slug
     */
    public function getItem($identifier): ?PortfolioItem
    {
        if (is_numeric($identifier)) {
            return PortfolioItem::find($identifier);
        }
        
        return PortfolioItem::where('slug', $identifier)->first();
    }

    /**
     * Create a new portfolio item
     */
    public function createItem(array $data, ?UploadedFile $image = null): PortfolioItem
    {
        $data['slug'] = $this->generateUniqueSlug($data['title']);
        
        if ($image) {
            $data['image_path'] = $this->storeImage($image);
        }
        
        return PortfolioItem::create($data);
    }

    /**
     * Update an existing portfolio item
     */
    public function updateItem($id, array $data, ?UploadedFile $image = null): bool
    {
        $item = $this->getItem($id);
        
        if (!$item) {
            return false;
        }
        
        if (isset($data['title']) && $data['title'] !== $item->title) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $item->id);
        }
        
        if ($image) {
            $this->deleteImage($item->image_path);
            $data['image_path'] = $this->storeImage($image);
        }
        
        return $item->update($data);
    }

    /**
     * Delete a portfolio item
     */
    public function deleteItem($id): bool
    {
        $item = $this->getItem($id);
        
        if (!$item) {
            return false;
        }
        
        $this->deleteImage($item->image_path);
        
        return $item->delete();
    }

    /**
     * Store an uploaded image
     */
    protected function storeImage(UploadedFile $image): string
    {
        $disk = config('portfolio.storage_disk', 'public');
        $path = $image->store('portfolio', $disk);
        
        return $path;
    }

    /**
     * Delete an image
     */
    protected function deleteImage(?string $path): void
    {
        if ($path && Storage::disk(config('portfolio.storage_disk', 'public'))->exists($path)) {
            Storage::disk(config('portfolio.storage_disk', 'public'))->delete($path);
        }
    }

    /**
     * Generate a unique slug for the portfolio item
     */
    protected function generateUniqueSlug(string $title, int $exceptId = null): string
    {
        $slug = Str::slug($title);
        $query = PortfolioItem::where('slug', $slug);
        
        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }
        
        if ($query->exists()) {
            $slug = $slug . '-' . Str::random(5);
        }
        
        return $slug;
    }
}
