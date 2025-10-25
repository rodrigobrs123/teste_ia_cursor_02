<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MercadoPagoService
{
    private $accessToken;
    private $publicKey;
    private $sandbox;
    private $baseUrl;

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token');
        $this->publicKey = config('services.mercadopago.public_key');
        $this->sandbox = config('services.mercadopago.sandbox', true);
        $this->baseUrl = $this->sandbox 
            ? 'https://api.mercadopago.com'
            : 'https://api.mercadopago.com';
    }

    public function processPayment(array $data): array
    {
        try {
            // Preparar dados do pagamento para Mercado Pago
            $paymentData = [
                'transaction_amount' => (float) $data['amount'],
                'description' => 'Pedido #' . $data['order_id'],
                'payment_method_id' => $this->getPaymentMethodId($data['payment_method']),
                'payer' => [
                    'email' => $data['customer']['email'],
                    'first_name' => $data['customer']['name'],
                    'identification' => [
                        'type' => 'CPF',
                        'number' => '12345678901' // Em produção, usar CPF real do cliente
                    ]
                ],
                'external_reference' => (string) $data['order_id'],
                'notification_url' => url('/api/orders/payment-callback'),
            ];

            // Adicionar dados do cartão se for cartão de crédito
            if ($data['payment_method'] === 'credit_card') {
                if (isset($data['card_token'])) {
                    // Usar token criado no frontend
                    $paymentData['token'] = $data['card_token'];
                } elseif (isset($data['card_data'])) {
                    // Fallback: criar token no backend (não recomendado para produção)
                    $paymentData['token'] = $this->createCardToken($data['card_data']);
                }
                $paymentData['installments'] = 1;
                $paymentData['issuer_id'] = null; // Será determinado automaticamente
            }

            // Fazer requisição para API do Mercado Pago
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
                'X-Idempotency-Key' => uniqid('mp_', true)
            ])->post($this->baseUrl . '/v1/payments', $paymentData);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'success' => true,
                    'status' => $this->mapStatus($result['status']),
                    'transaction_id' => (string) $result['id'],
                    'payment_url' => $result['point_of_interaction']['transaction_data']['ticket_url'] ?? null,
                    'qr_code' => $result['point_of_interaction']['transaction_data']['qr_code'] ?? null,
                    'message' => $this->getStatusMessage($result['status']),
                    'raw_response' => $result
                ];
            }

            $errorData = $response->json();
            Log::error('Erro na API do Mercado Pago', [
                'status' => $response->status(),
                'response' => $errorData
            ]);

            return [
                'success' => false,
                'message' => 'Erro na comunicação com o gateway de pagamento: ' . 
                           ($errorData['message'] ?? 'Erro desconhecido')
            ];

        } catch (\Exception $e) {
            Log::error('Erro no processamento do pagamento Mercado Pago: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Erro interno no processamento do pagamento'
            ];
        }
    }

    private function createCardToken(array $cardData): string
    {
        try {
            // Em um cenário real, o token do cartão seria criado no frontend
            // usando o SDK JavaScript do Mercado Pago
            // Aqui vamos simular para demonstração
            $tokenData = [
                'card_number' => $cardData['number'],
                'security_code' => $cardData['cvv'],
                'expiration_month' => (int) $cardData['expiry_month'],
                'expiration_year' => (int) $cardData['expiry_year'],
                'cardholder' => [
                    'name' => $cardData['holder_name'],
                    'identification' => [
                        'type' => 'CPF',
                        'number' => '12345678901'
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->publicKey,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/v1/card_tokens', $tokenData);

            if ($response->successful()) {
                $result = $response->json();
                return $result['id'];
            }

            throw new \Exception('Erro ao criar token do cartão: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('Erro ao criar token do cartão: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getPaymentMethodId(string $paymentMethod): string
    {
        switch ($paymentMethod) {
            case 'credit_card':
                return 'visa'; // Em produção, detectar automaticamente
            case 'pix':
                return 'pix';
            case 'boleto':
                return 'bolbradesco';
            default:
                return 'visa';
        }
    }

    private function mapStatus(string $mpStatus): string
    {
        switch ($mpStatus) {
            case 'approved':
                return 'approved';
            case 'pending':
                return 'pending';
            case 'in_process':
                return 'pending';
            case 'rejected':
                return 'rejected';
            case 'cancelled':
                return 'cancelled';
            default:
                return 'pending';
        }
    }

    private function getStatusMessage(string $status): string
    {
        switch ($status) {
            case 'approved':
                return 'Pagamento aprovado com sucesso';
            case 'pending':
                return 'Pagamento pendente de confirmação';
            case 'in_process':
                return 'Pagamento em processamento';
            case 'rejected':
                return 'Pagamento rejeitado';
            case 'cancelled':
                return 'Pagamento cancelado';
            default:
                return 'Status do pagamento: ' . $status;
        }
    }

    public function checkPaymentStatus(string $transactionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken
            ])->get($this->baseUrl . '/v1/payments/' . $transactionId);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'success' => true,
                    'status' => $this->mapStatus($result['status']),
                    'transaction_id' => (string) $result['id'],
                    'raw_response' => $result
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro ao consultar status do pagamento'
            ];

        } catch (\Exception $e) {
            Log::error('Erro ao consultar status do pagamento Mercado Pago: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro interno na consulta do pagamento'
            ];
        }
    }

    public function getPublicKey(): string
    {
        if (empty($this->publicKey)) {
            throw new \Exception('MercadoPago public key is not configured. Please check your environment variables.');
        }
        return $this->publicKey;
    }

    public function createPreference(array $data): array
    {
        try {
            $preferenceData = [
                'items' => [
                    [
                        'title' => 'Pedido #' . $data['order_id'],
                        'quantity' => 1,
                        'unit_price' => (float) $data['amount'],
                        'currency_id' => 'BRL'
                    ]
                ],
                'payer' => [
                    'email' => $data['customer']['email'],
                    'name' => $data['customer']['name']
                ],
                'external_reference' => (string) $data['order_id'],
                'notification_url' => url('/api/orders/payment-callback'),
                'back_urls' => [
                    'success' => url('/order-success'),
                    'failure' => url('/checkout'),
                    'pending' => url('/order-success')
                ],
                'auto_return' => 'approved'
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/checkout/preferences', $preferenceData);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'success' => true,
                    'preference_id' => $result['id'],
                    'init_point' => $result['init_point'],
                    'sandbox_init_point' => $result['sandbox_init_point']
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro ao criar preferência de pagamento'
            ];

        } catch (\Exception $e) {
            Log::error('Erro ao criar preferência Mercado Pago: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro interno ao criar preferência'
            ];
        }
    }
}