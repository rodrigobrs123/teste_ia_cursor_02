<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;

// Autenticação
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/my-orders', [AuthController::class, 'orders']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
});

// Categorias
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Produtos
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// CSRF token endpoint
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Debug session endpoint
Route::get('/debug/session', function (Illuminate\Http\Request $request) {
    if (!$request->session()->isStarted()) {
        $request->session()->start();
    }
    
    return response()->json([
        'session_id' => $request->session()->getId(),
        'session_started' => $request->session()->isStarted(),
        'session_data' => $request->session()->all()
    ]);
});

// Carrinho - usar apenas middleware api com sessões habilitadas
Route::middleware(['api'])->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
});

// Pedidos - usar apenas middleware api com sessões habilitadas
Route::middleware(['api'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
});
Route::post('/orders/payment-callback', [OrderController::class, 'paymentCallback']);
