<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        $category->load(['products' => function ($query) {
            $query->where('active', true)->with('category');
        }]);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }
}
