<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->where('active', true);

        // Filtro por categoria
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtro por busca
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if ($sortBy === 'price') {
            $query->orderByRaw('COALESCE(sale_price, price) ' . $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginação
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function featured(): JsonResponse
    {
        $products = Product::with('category')
            ->where('active', true)
            ->where('featured', true)
            ->take(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}
