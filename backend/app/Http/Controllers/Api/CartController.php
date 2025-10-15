<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }
        
        $sessionId = $request->session()->getId();
        
        $cartItems = CartItem::with('product.category')
            ->where('session_id', $sessionId)
            ->get();

        $total = $cartItems->sum(function ($item) {
            return $item->getTotal();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cartItems,
                'total' => $total,
                'count' => $cartItems->sum('quantity')
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);
        
        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }
        
        $sessionId = $request->session()->getId();

        // Verificar estoque
        if ($product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Estoque insuficiente'
            ], 400);
        }

        // Verificar se o item já existe no carrinho
        $cartItem = CartItem::where('session_id', $sessionId)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;
            
            if ($product->stock < $newQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estoque insuficiente'
                ], 400);
            }
            
            $cartItem->update([
                'quantity' => $newQuantity,
                'price' => $product->getCurrentPrice()
            ]);
        } else {
            $cartItem = CartItem::create([
                'session_id' => $sessionId,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'price' => $product->getCurrentPrice()
            ]);
        }

        $cartItem->load('product.category');

        return response()->json([
            'success' => true,
            'message' => 'Produto adicionado ao carrinho',
            'data' => $cartItem
        ]);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }
        
        $sessionId = $request->session()->getId();

        if ($cartItem->session_id !== $sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Item não encontrado'
            ], 404);
        }

        // Verificar estoque
        if ($cartItem->product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Estoque insuficiente'
            ], 400);
        }

        $cartItem->update([
            'quantity' => $request->quantity,
            'price' => $cartItem->product->getCurrentPrice()
        ]);

        $cartItem->load('product.category');

        return response()->json([
            'success' => true,
            'message' => 'Carrinho atualizado',
            'data' => $cartItem
        ]);
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }
        
        $sessionId = $request->session()->getId();

        if ($cartItem->session_id !== $sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Item não encontrado'
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removido do carrinho'
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        // Start session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }
        
        $sessionId = $request->session()->getId();

        CartItem::where('session_id', $sessionId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Carrinho limpo'
        ]);
    }
}
