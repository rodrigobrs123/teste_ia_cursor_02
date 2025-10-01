<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// MercadoPago callback routes
Route::get('/payment/success', function () {
    $paymentId = request('payment_id');
    $status = request('status');
    $externalReference = request('external_reference');
    
    if ($externalReference) {
        $order = \App\Models\Order::where('order_number', $externalReference)->first();
        if ($order) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . "/payment-success/{$order->id}?" . http_build_query(request()->all()));
        }
    }
    
    return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/payment-error?' . http_build_query(request()->all()));
});

Route::get('/payment/failure', function () {
    $externalReference = request('external_reference');
    
    if ($externalReference) {
        $order = \App\Models\Order::where('order_number', $externalReference)->first();
        if ($order) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . "/payment-error/{$order->id}?" . http_build_query(request()->all()));
        }
    }
    
    return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/payment-error?' . http_build_query(request()->all()));
});

Route::get('/payment/pending', function () {
    $externalReference = request('external_reference');
    
    if ($externalReference) {
        $order = \App\Models\Order::where('order_number', $externalReference)->first();
        if ($order) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . "/payment-error/{$order->id}?" . http_build_query(request()->all()));
        }
    }
    
    return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/payment-error?' . http_build_query(request()->all()));
});