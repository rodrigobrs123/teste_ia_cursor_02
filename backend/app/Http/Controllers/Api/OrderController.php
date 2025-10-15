<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\NuvemPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected $nuvemPagoService;

    public function __construct(NuvemPagoService $nuvemPagoService)
    {
        $this->nuvemPagoService = $nuvemPagoService;
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|in:credit_card,pix,boleto',
            'card_data' => 'required_if:payment_method,credit_card|array',
            'card_data.number' => 'required_if:payment_method,credit_card|string',
            'card_data.holder_name' => 'required_if:payment_method,credit_card|string',
            'card_data.expiry_month' => 'required_if:payment_method,credit_card|integer|between:1,12',
            'card_data.expiry_year' => 'required_if:payment_method,credit_card|integer|min:2024',
            'card_data.cvv' => 'required_if:payment_method,credit_card|string|size:3'
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

            // Calcular totais
            $subtotal = $cartItems->sum(function ($item) {
                return $item->getTotal();
            });
            
            // Frete grátis para compras acima de R$ 200
            $shippingCost = $subtotal >= 200 ? 0 : 15.00;
            $total = $subtotal + $shippingCost;

            // Criar pedido
            $order = Order::create([
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $request->payment_method,
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

            // Processar pagamento
            $paymentData = [
                'amount' => $total,
                'currency' => 'BRL',
                'payment_method' => $request->payment_method,
                'customer' => [
                    'name' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone' => $request->customer_phone
                ],
                'order_id' => $order->order_number
            ];

            if ($request->payment_method === 'credit_card') {
                $paymentData['card_data'] = $request->card_data;
            }

            $paymentResult = $this->nuvemPagoService->processPayment($paymentData);

            if ($paymentResult['success']) {
                $order->update([
                    'payment_status' => $paymentResult['status'] === 'approved' ? 'paid' : 'pending',
                    'payment_transaction_id' => $paymentResult['transaction_id'],
                    'status' => $paymentResult['status'] === 'approved' ? 'processing' : 'pending'
                ]);

                // Limpar carrinho
                CartItem::where('session_id', $sessionId)->delete();

                DB::commit();

                $order->load('orderItems.product');

                return response()->json([
                    'success' => true,
                    'message' => 'Pedido criado com sucesso',
                    'data' => [
                        'order' => $order,
                        'payment' => $paymentResult
                    ]
                ]);
            } else {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Erro no processamento do pagamento: ' . $paymentResult['message']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    public function show(Order $order): JsonResponse
    {
        $order->load('orderItems.product');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        // Check if order belongs to the authenticated user
        $user = $request->user();
        if (!$user || $order->customer_email !== $user->email) {
            return response()->json([
                'success' => false,
                'message' => 'Pedido não encontrado'
            ], 404);
        }

        // Check if order can be cancelled (within 7 days and not already shipped/delivered)
        $orderDate = $order->created_at;
        $daysSinceOrder = $orderDate->diffInDays(now());
        
        if ($daysSinceOrder > 7) {
            return response()->json([
                'success' => false,
                'message' => 'Pedidos só podem ser cancelados até 7 dias após a data da compra'
            ], 400);
        }

        if (in_array($order->status, ['shipped', 'delivered', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Este pedido não pode ser cancelado'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update order status
            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
                'cancelled_at' => now()
            ]);

            // Restore stock for all items
            foreach ($order->orderItems as $orderItem) {
                if ($orderItem->product) {
                    $orderItem->product->increment('stock', $orderItem->quantity);
                }
            }

            // If payment was processed, initiate refund process
            if ($order->payment_status === 'paid') {
                $order->update(['refund_status' => 'requested']);
                
                // Here you would integrate with payment provider's refund API
                // For now, we'll just mark it as requested
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso. Se o pagamento foi processado, o reembolso será processado em até 5 dias úteis.',
                'data' => $order->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido'
            ], 500);
        }
    }

    public function paymentCallback(Request $request): JsonResponse
    {
        // Webhook do NuvemPago
        $data = $request->all();

        if (isset($data['order_id']) && isset($data['status'])) {
            $order = Order::where('order_number', $data['order_id'])->first();

            if ($order) {
                $order->update([
                    'payment_status' => $data['status'] === 'approved' ? 'paid' : 'failed',
                    'status' => $data['status'] === 'approved' ? 'processing' : 'cancelled'
                ]);

                return response()->json(['success' => true]);
            }
        }

        return response()->json(['success' => false], 400);
    }
}
