<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Payment;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\OrderResource;

class OrderController extends Controller
{
    protected $mercadoPagoService;

    public function __construct(MercadoPagoService $mercadoPagoService)
    {
        $this->mercadoPagoService = $mercadoPagoService;
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_cpf' => 'required|string|size:11',
            'customer_date_of_birth' => 'nullable|date',
            'shipping_address' => 'required|string',
            'create_account' => 'boolean',
            'password' => 'required_if:create_account,true|min:6'
        ]);

        $sessionId = $request->session()->getId();

        // Buscar itens do carrinho
        $cartItems = CartItem::with('product')
            ->where('session_id', $sessionId)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Carrinho está vazio'
            ], 400);
        }

        // Verificar estoque
        foreach ($cartItems as $cartItem) {
            if ($cartItem->product->stock < $cartItem->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Estoque insuficiente para o produto: {$cartItem->product->name}"
                ], 400);
            }
        }

        try {
            DB::beginTransaction();

            // Criar ou encontrar cliente
            $customer = null;
            if ($request->create_account) {
                $customer = Customer::create([
                    'name' => $request->customer_name,
                    'email' => $request->customer_email,
                    'cpf' => $request->customer_cpf,
                    'date_of_birth' => $request->customer_date_of_birth,
                    'phone' => $request->customer_phone,
                    'address' => $request->shipping_address,
                    'password' => Hash::make($request->password)
                ]);
            } else {
                // Verificar se já existe um cliente com este CPF
                $customer = Customer::where('cpf', $request->customer_cpf)->first();
            }

            // Calcular totais
            $subtotal = $cartItems->sum(function ($item) {
                return $item->getTotal();
            });
            $shippingCost = $subtotal >= 200 ? 0 : 15.00;
            $total = $subtotal + $shippingCost;

            // Criar pedido
            $order = Order::create([
                'customer_id' => $customer?->id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'customer_cpf' => $request->customer_cpf,
                'customer_date_of_birth' => $request->customer_date_of_birth,
                'shipping_address' => $request->shipping_address,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending'
            ]);

            // Criar itens do pedido
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'product_sku' => $cartItem->product->sku,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'total' => $cartItem->getTotal()
                ]);

                // Reduzir estoque
                $cartItem->product->decrement('stock', $cartItem->quantity);
            }

            // Preparar dados para MercadoPago
            $items = [];
            foreach ($cartItems as $cartItem) {
                $items[] = [
                    'id' => $cartItem->product->id,
                    'title' => $cartItem->product->name,
                    'description' => $cartItem->product->short_description ?? $cartItem->product->name,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price
                ];
            }

            // Adicionar frete como item se houver
            if ($shippingCost > 0) {
                $items[] = [
                    'id' => 'shipping',
                    'title' => 'Frete',
                    'description' => 'Taxa de entrega',
                    'quantity' => 1,
                    'unit_price' => $shippingCost
                ];
            }

            $preferenceData = [
                'items' => $items,
                'payer' => [
                    'name' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone' => $request->customer_phone,
                    'cpf' => $request->customer_cpf,
                    'date_created' => $request->customer_date_of_birth
                ],
                'external_reference' => $order->order_number,
                'order_id' => $order->id
            ];

            $preferenceResult = $this->mercadoPagoService->createPreference($preferenceData);

            if ($preferenceResult['success']) {
                // Limpar carrinho
                CartItem::where('session_id', $sessionId)->delete();

                DB::commit();

                $order->load('orderItems.product');

                return response()->json([
                    'success' => true,
                    'message' => 'Pedido criado com sucesso',
                    'data' => [
                        'order' => $order,
                        'checkout_url' => $preferenceResult['checkout_url'],
                        'preference_id' => $preferenceResult['preference_id']
                    ]
                ]);
            } else {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao criar preferência de pagamento: ' . $preferenceResult['message']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

 /*   public function show(Order $order): JsonResponse
    {
        $order->load('orderItems.product');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }*/


    public function show(Order $order): JsonResponse
    {
        $order->load('orderItems.product');

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order)
        ]);
    }

    public function paymentWebhook(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            $webhookResult = $this->mercadoPagoService->processWebhook($data);
            
            if ($webhookResult['success']) {
                $order = Order::where('order_number', $webhookResult['external_reference'])->first();
                
                if ($order) {
                    $paymentStatus = $this->mercadoPagoService->mapPaymentStatus($webhookResult['status']);
                    
                    // Criar ou atualizar registro de pagamento
                    $payment = Payment::updateOrCreate(
                        ['payment_id' => $webhookResult['payment_id']],
                        [
                            'order_id' => $order->id,
                            'customer_id' => $order->customer_id,
                            'external_reference' => $order->order_number,
                            'amount' => $order->total,
                            'status' => $paymentStatus,
                            'payment_data' => $webhookResult['payment_data'],
                            'paid_at' => $paymentStatus === 'paid' ? now() : null
                        ]
                    );
                    
                    // Atualizar status do pedido
                    $orderStatus = match($paymentStatus) {
                        'paid' => 'processing',
                        'failed', 'cancelled' => 'cancelled',
                        default => 'pending'
                    };
                    
                    $order->update([
                        'payment_status' => $paymentStatus,
                        'status' => $orderStatus,
                        'payment_transaction_id' => $webhookResult['payment_id']
                    ]);
                    
                    return response()->json(['success' => true]);
                }
            }
            
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function paymentSuccess(Request $request): JsonResponse
    {
        $paymentId = $request->get('payment_id');
        $status = $request->get('status');
        $externalReference = $request->get('external_reference');
        
        if ($paymentId && $externalReference) {
            $order = Order::where('order_number', $externalReference)->first();
            
            if ($order) {
                return response()->json([
                    'success' => true,
                    'redirect_url' => url("/payment-success/{$order->id}")
                ]);
            }
        }
        
        return response()->json([
            'success' => false,
            'redirect_url' => url('/payment-error')
        ]);
    }

    public function paymentFailure(Request $request): JsonResponse
    {
        $externalReference = $request->get('external_reference');
        
        if ($externalReference) {
            $order = Order::where('order_number', $externalReference)->first();
            
            if ($order) {
                return response()->json([
                    'success' => false,
                    'redirect_url' => url("/payment-error/{$order->id}")
                ]);
            }
        }
        
        return response()->json([
            'success' => false,
            'redirect_url' => url('/payment-error')
        ]);
    }
}
