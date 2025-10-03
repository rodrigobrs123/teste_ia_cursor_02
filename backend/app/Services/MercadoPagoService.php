<?php

namespace App\Services;

use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Resources\Preference;
use MercadoPago\Resources\Payment;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    private $accessToken;
    private $sandbox;

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token');
        $this->sandbox = config('services.mercadopago.sandbox', true);
        
        // Configure MercadoPago SDK
        MercadoPagoConfig::setAccessToken($this->accessToken);
        MercadoPagoConfig::setRuntimeEnviroment($this->sandbox ? 'sandbox' : 'production');
    }

    /**
     * Create payment preference for checkout
     */
    public function createPreference(array $data): array
    {
        try {
            $client = new PreferenceClient();
            
            $items = [];
            foreach ($data['items'] as $item) {
                $items[] = [
                    'id' => $item['id'],
                    'title' => $item['title'],
                    'description' => $item['description'] ?? '',
                    'quantity' => $item['quantity'],
                    'unit_price' => (float) $item['unit_price'],
                    'currency_id' => 'BRL'
                ];
            }

            $preference = $client->create([
                'items' => $items,
                'payer' => [
                    'name' => $data['payer']['name'],
                    'email' => $data['payer']['email'],
                    'phone' => [
                        'number' => $data['payer']['phone']
                    ],
                    'identification' => [
                        'type' => 'CPF',
                        'number' => $data['payer']['cpf'] ?? ''
                    ],
                    'date_created' => $data['payer']['date_created'] ?? null
                ],
                'back_urls' => [
                    'success' => config('app.frontend_url', 'http://localhost:3000') . '/payment-success/' . $data['order_id'],
                    'failure' => config('app.frontend_url', 'http://localhost:3000') . '/payment-error/' . ($data['order_id'] ?? ''),
                    'pending' => config('app.frontend_url', 'http://localhost:3000') . '/payment-error/' . ($data['order_id'] ?? '')
                ],
                'auto_return' => 'approved',
                'payment_methods' => [
                    'excluded_payment_methods' => [],
                    'excluded_payment_types' => [],
                    'installments' => 12
                ],
                'notification_url' => url('/api/orders/payment-webhook'),
                'external_reference' => $data['external_reference'],
                'expires' => true,
                'expiration_date_from' => now()->toISOString(),
                'expiration_date_to' => now()->addHours(24)->toISOString()
            ]);

            return [
                'success' => true,
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point,
                'checkout_url' => $this->sandbox ? $preference->sandbox_init_point : $preference->init_point,
                'qr_code' => $preference->qr_code ?? null
            ];

        } catch (\Exception $e) {
            Log::error('MercadoPago preference creation error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro ao criar preferência de pagamento: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payment information
     */
    public function getPayment(string $paymentId): array
    {
        try {
            $client = new PaymentClient();
            $payment = $client->get($paymentId);

            return [
                'success' => true,
                'payment' => [
                    'id' => $payment->id,
                    'status' => $payment->status,
                    'status_detail' => $payment->status_detail,
                    'transaction_amount' => $payment->transaction_amount,
                    'currency_id' => $payment->currency_id,
                    'date_created' => $payment->date_created,
                    'date_approved' => $payment->date_approved,
                    'external_reference' => $payment->external_reference,
                    'payment_method_id' => $payment->payment_method_id,
                    'payment_type_id' => $payment->payment_type_id,
                    'payer' => [
                        'email' => $payment->payer->email ?? null,
                        'identification' => $payment->payer->identification ?? null
                    ]
                ]
            ];

        } catch (\Exception $e) {
            Log::error('MercadoPago payment retrieval error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro ao consultar pagamento: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process webhook notification
     */
    public function processWebhook(array $data): array
    {
        try {
            if (!isset($data['type']) || $data['type'] !== 'payment') {
                return [
                    'success' => false,
                    'message' => 'Tipo de notificação não suportado'
                ];
            }

            $paymentId = $data['data']['id'];
            $paymentInfo = $this->getPayment($paymentId);

            if (!$paymentInfo['success']) {
                return $paymentInfo;
            }

            return [
                'success' => true,
                'payment_id' => $paymentId,
                'status' => $paymentInfo['payment']['status'],
                'external_reference' => $paymentInfo['payment']['external_reference'],
                'payment_data' => $paymentInfo['payment']
            ];

        } catch (\Exception $e) {
            Log::error('MercadoPago webhook processing error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro ao processar webhook: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payment status mapping
     */
    public function getPaymentStatusMapping(): array
    {
        return [
            'approved' => 'paid',
            'pending' => 'pending',
            'in_process' => 'processing',
            'rejected' => 'failed',
            'cancelled' => 'cancelled',
            'refunded' => 'refunded',
            'charged_back' => 'chargeback'
        ];
    }

    /**
     * Map MercadoPago status to internal status
     */
    public function mapPaymentStatus(string $mpStatus): string
    {
        $mapping = $this->getPaymentStatusMapping();
        return $mapping[$mpStatus] ?? 'unknown';
    }
}