<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Autenticação de clientes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
});

// Categorias
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Produtos
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/search-suggestions', [ProductController::class, 'searchSuggestions']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Carrinho
Route::group(['middleware' => ['web']], function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Pedidos
    Route::post('/orders', [OrderController::class, 'store']);
});

Route::get('/orders/{order}', [OrderController::class, 'show']);

// MercadoPago webhooks e callbacks
Route::post('/orders/payment-webhook', [OrderController::class, 'paymentWebhook']);
Route::get('/payment/success', [OrderController::class, 'paymentSuccess']);
Route::get('/payment/failure', [OrderController::class, 'paymentFailure']);
Route::get('/payment/pending', [OrderController::class, 'paymentFailure']);