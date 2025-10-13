<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NuvemPagoService
{
    private $baseUrl;
    private $clientId;
    private $clientSecret;
    private $sandbox;

    public function __construct()
    {
        $this->baseUrl = config('services.nuvempago.sandbox') 
            ? 'https://sandbox.nuvempago.com.br/api/v1'
            : 'https://api.nuvempago.com.br/v1';
        
        $this->clientId = config('services.nuvempago.client_id');
        $this->clientSecret = config('services.nuvempago.client_secret');
        $this->sandbox = config('services.nuvempago.sandbox', true);
    }

    public function processPayment(array $data): array
    {
        try {
            // Simular integração com NuvemPago (para demonstração)
            if ($this->sandbox) {
                return $this->simulatePayment($data);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getAccessToken(),
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/payments', [
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'payment_method' => $data['payment_method'],
                'customer' => $data['customer'],
                'order_reference' => $data['order_id'],
                'card_data' => $data['card_data'] ?? null,
                'callback_url' => url('/api/orders/payment-callback')
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'success' => true,
                    'status' => $result['status'],
                    'transaction_id' => $result['transaction_id'],
                    'payment_url' => $result['payment_url'] ?? null,
                    'message' => 'Pagamento processado com sucesso'
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro na comunicação com o gateway de pagamento'
            ];

        } catch (\Exception $e) {
            Log::error('Erro no processamento do pagamento: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro interno no processamento do pagamento'
            ];
        }
    }

    private function simulatePayment(array $data): array
    {
        // Simulação para demonstração
        $transactionId = 'TXN_' . uniqid();
        
        // Simular diferentes cenários baseado no método de pagamento
        switch ($data['payment_method']) {
            case 'credit_card':
                // Simular aprovação automática para cartão
                return [
                    'success' => true,
                    'status' => 'approved',
                    'transaction_id' => $transactionId,
                    'message' => 'Pagamento aprovado com cartão de crédito'
                ];
                
            case 'pix':
                // PIX requer confirmação manual
                return [
                    'success' => true,
                    'status' => 'pending',
                    'transaction_id' => $transactionId,
                    'payment_url' => url('/payment/pix/' . $transactionId),
                    'qr_code' => $this->generatePixQrCode($data['amount']),
                    'message' => 'PIX gerado. Aguardando pagamento.'
                ];
                
            case 'boleto':
                // Boleto sempre fica pendente
                return [
                    'success' => true,
                    'status' => 'pending',
                    'transaction_id' => $transactionId,
                    'payment_url' => url('/payment/boleto/' . $transactionId),
                    'message' => 'Boleto gerado. Aguardando pagamento.'
                ];
                
            default:
                return [
                    'success' => false,
                    'message' => 'Método de pagamento não suportado'
                ];
        }
    }

    private function getAccessToken(): string
    {
        // Em um cenário real, você faria uma requisição para obter o token
        // e implementaria cache para não solicitar a cada requisição
        return 'mock_access_token';
    }

    private function generatePixQrCode(float $amount): string
    {
        // Simular geração de QR Code PIX
        return '00020126580014BR.GOV.BCB.PIX013636c8c8c8-1234-1234-1234-123456789abc5204000053039865802BR5925LOJA ESPORTES LTDA6009SAO PAULO62070503***6304' . sprintf('%04d', $amount * 100);
    }

    public function checkPaymentStatus(string $transactionId): array
    {
        try {
            if ($this->sandbox) {
                // Simular status do pagamento
                return [
                    'success' => true,
                    'status' => 'approved',
                    'transaction_id' => $transactionId
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getAccessToken()
            ])->get($this->baseUrl . '/payments/' . $transactionId);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'success' => true,
                    'status' => $result['status'],
                    'transaction_id' => $result['transaction_id']
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro ao consultar status do pagamento'
            ];

        } catch (\Exception $e) {
            Log::error('Erro ao consultar status do pagamento: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro interno na consulta do pagamento'
            ];
        }
    }
}