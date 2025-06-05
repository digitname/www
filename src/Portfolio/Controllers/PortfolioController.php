<?php

namespace App\Portfolio\Controllers;

use App\Http\Controllers\Controller;
use App\Portfolio\Models\PortfolioItem;
use App\Portfolio\Services\PortfolioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PortfolioController extends Controller
{
    protected $portfolioService;

    public function __construct(PortfolioService $portfolioService)
    {
        $this->portfolioService = $portfolioService;
    }

    /**
     * Display a listing of the portfolio items
     */
    public function index()
    {
        $items = $this->portfolioService->getAllItems();
        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * Display the specified portfolio item
     */
    public function show($id)
    {
        $item = $this->portfolioService->getItem($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Portfolio item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * Store a newly created portfolio item
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'nullable|string',
            'image' => 'nullable|image|max:' . (config('portfolio.image_max_size', 5120)),
            'url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'technologies' => 'nullable|array',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');
        $image = $request->file('image');

        try {
            $item = $this->portfolioService->createItem($data, $image);
            
            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Portfolio item created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create portfolio item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified portfolio item
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'content' => 'nullable|string',
            'image' => 'nullable|image|max:' . (config('portfolio.image_max_size', 5120)),
            'url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'technologies' => 'nullable|array',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');
        $image = $request->file('image');

        try {
            $updated = $this->portfolioService->updateItem($id, $data, $image);
            
            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Portfolio item not found'
                ], 404);
            }

            $item = $this->portfolioService->getItem($id);
            
            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Portfolio item updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update portfolio item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified portfolio item
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->portfolioService->deleteItem($id);
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Portfolio item not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Portfolio item deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete portfolio item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
