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
                // Remove accents and normalize search
                $normalizedSearch = $this->normalizeString($search);
                
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'ã', 'a'), 'á', 'a'), 'à', 'a'), 'â', 'a'), 'é', 'e'), 'ê', 'e')) LIKE ?", ["%{$normalizedSearch}%"])
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'ã', 'a'), 'á', 'a'), 'à', 'a'), 'â', 'a'), 'é', 'e'), 'ê', 'e')) LIKE ?", ["%{$normalizedSearch}%"]);
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

    public function searchSuggestions(Request $request): JsonResponse
    {
        $search = $request->get('q', '');
        
        if (strlen($search) < 2) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $normalizedSearch = $this->normalizeString($search);
        
        $suggestions = Product::where('active', true)
            ->where(function ($q) use ($search, $normalizedSearch) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'ã', 'a'), 'á', 'a'), 'à', 'a'), 'â', 'a'), 'é', 'e'), 'ê', 'e')) LIKE ?", ["%{$normalizedSearch}%"]);
            })
            ->select('id', 'name', 'images')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'image' => $product->images[0] ?? null
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $suggestions
        ]);
    }

    private function normalizeString(string $string): string
    {
        $string = strtolower($string);
        $string = str_replace(['ã', 'á', 'à', 'â', 'ä'], 'a', $string);
        $string = str_replace(['é', 'ê', 'è', 'ë'], 'e', $string);
        $string = str_replace(['í', 'î', 'ì', 'ï'], 'i', $string);
        $string = str_replace(['õ', 'ó', 'ô', 'ò', 'ö'], 'o', $string);
        $string = str_replace(['ú', 'û', 'ù', 'ü'], 'u', $string);
        $string = str_replace(['ç'], 'c', $string);
        return $string;
    }
}
