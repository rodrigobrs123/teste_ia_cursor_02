# Guia de Integração MercadoPago - Loja Virtual

## Visão Geral

Esta aplicação foi completamente integrada com o MercadoPago para processar pagamentos de forma segura e eficiente. O sistema suporta PIX, cartão de crédito, débito e outros métodos de pagamento disponíveis no MercadoPago.

## Arquitetura da Solução

### Backend (Laravel)
- **MercadoPagoService**: Serviço principal para integração com a API do MercadoPago
- **OrderController**: Controlador para gerenciar pedidos e pagamentos
- **AuthController**: Sistema de autenticação de clientes
- **Modelos**: Customer, Order, Payment para gerenciar dados
- **Migrações**: Tabelas para clientes, pedidos e pagamentos

### Frontend (React)
- **Checkout**: Formulário único para dados do cliente e criação de conta
- **PaymentSuccess**: Página de sucesso do pagamento
- **PaymentError**: Página de erro com orientações
- **AuthContext**: Gerenciamento de autenticação
- **CartContext**: Gerenciamento do carrinho

## Fluxo de Pagamento

1. **Cliente adiciona produtos ao carrinho**
2. **Cliente vai para checkout e preenche dados**
3. **Sistema cria pedido e preferência no MercadoPago**
4. **Cliente é redirecionado para MercadoPago**
5. **MercadoPago processa pagamento (PIX, cartão, etc.)**
6. **Cliente é redirecionado de volta com resultado**
7. **Webhook atualiza status do pagamento no banco**

## Configuração

### 1. Configurar MercadoPago

Edite o arquivo `/workspace/backend/.env`:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_PUBLIC_KEY=your_public_key_here
MERCADOPAGO_SANDBOX=true

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

### 2. Obter Credenciais do MercadoPago

#### Para Testes (Sandbox):
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação
3. Vá em "Credenciais de teste"
4. Copie o Access Token e Public Key

#### Para Produção:
1. Na mesma aplicação, vá em "Credenciais de produção"
2. Configure `MERCADOPAGO_SANDBOX=false`
3. Use as credenciais de produção

### 3. Configurar Webhooks

No painel do MercadoPago, configure o webhook:
- URL: `https://seu-dominio.com/api/orders/payment-webhook`
- Eventos: `payment`

## Instalação e Execução

### Backend (Laravel)

```bash
cd /workspace/backend

# Instalar dependências
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Executar migrações
php artisan migrate

# Iniciar servidor
php artisan serve
```

### Frontend (React)

```bash
cd /workspace/frontend

# Instalar dependências
npm install

# Configurar API URL (se necessário)
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Iniciar aplicação
npm start
```

## Testando Pagamentos

### 1. Dados de Teste para PIX

**Cenário de Sucesso:**
- CPF: `12345678909`
- Email: `test_user_123@testuser.com`

**Cenário de Falha:**
- CPF: `12345678901`
- Email: `test_user_456@testuser.com`

### 2. Cartões de Teste

#### Cartão Aprovado:
- **Número**: `4235 6477 2802 5682`
- **Vencimento**: `11/25`
- **CVV**: `123`
- **Nome**: `APRO`

#### Cartão Rejeitado por Saldo:
- **Número**: `4013 5406 8274 6260`
- **Vencimento**: `11/25`
- **CVV**: `123`
- **Nome**: `FUND`

#### Cartão Rejeitado por Dados:
- **Número**: `4509 9535 6623 3704`
- **Vencimento**: `11/25`
- **CVV**: `123`
- **Nome**: `OTHE`

### 3. Outros Métodos

#### Boleto:
- Sempre será aprovado em sandbox
- Prazo de 3 dias úteis para pagamento

#### Débito:
- Use os mesmos cartões de teste
- Será processado como débito

## Passo a Passo para Testar

### Teste Completo - PIX

1. **Acesse a loja**: `http://localhost:3000`

2. **Adicione produtos ao carrinho**:
   - Navegue pelos produtos
   - Clique em "Adicionar ao Carrinho"
   - Vá para o carrinho

3. **Finalize a compra**:
   - Clique em "Finalizar Compra"
   - Preencha os dados:
     ```
     Nome: João Silva
     Email: test_user_123@testuser.com
     CPF: 12345678909
     Telefone: (11) 99999-9999
     Data de Nascimento: 01/01/1990
     Endereço: Rua Teste, 123, São Paulo, SP, 01234-567
     ```
   - Marque "Criar conta" se desejar
   - Clique em "Pagar com MercadoPago"

4. **No MercadoPago**:
   - Escolha "PIX"
   - Escaneie o QR Code ou copie o código
   - Simule o pagamento (em sandbox é automático)

5. **Retorno**:
   - Será redirecionado para página de sucesso
   - Verifique os dados do pedido

### Teste Completo - Cartão de Crédito

1. **Repita os passos 1-3 acima**

2. **No MercadoPago**:
   - Escolha "Cartão de Crédito"
   - Use os dados de teste:
     ```
     Número: 4235 6477 2802 5682
     Vencimento: 11/25
     CVV: 123
     Nome: APRO
     ```
   - Confirme o pagamento

3. **Resultado**:
   - Pagamento aprovado instantaneamente
   - Redirecionamento para sucesso

### Teste de Falha

1. **Use cartão rejeitado**:
   ```
   Número: 4013 5406 8274 6260
   Vencimento: 11/25
   CVV: 123
   Nome: FUND
   ```

2. **Resultado**:
   - Pagamento rejeitado
   - Redirecionamento para página de erro
   - Opções para tentar novamente

## Estrutura do Banco de Dados

### Tabela `customers`
```sql
- id (primary key)
- name (varchar)
- email (varchar, unique)
- cpf (varchar, unique)
- date_of_birth (date)
- phone (varchar)
- address (text)
- password (varchar, hashed)
- created_at, updated_at
```

### Tabela `orders`
```sql
- id (primary key)
- customer_id (foreign key, nullable)
- order_number (varchar, unique)
- customer_name (varchar)
- customer_email (varchar)
- customer_phone (varchar)
- customer_cpf (varchar)
- customer_date_of_birth (date)
- shipping_address (text)
- subtotal (decimal)
- shipping_cost (decimal)
- total (decimal)
- status (varchar)
- payment_status (varchar)
- payment_transaction_id (varchar)
- created_at, updated_at
```

### Tabela `payments`
```sql
- id (primary key)
- order_id (foreign key)
- customer_id (foreign key, nullable)
- payment_id (varchar, unique) -- ID do MercadoPago
- preference_id (varchar)
- external_reference (varchar) -- Número do pedido
- amount (decimal)
- currency (varchar, default 'BRL')
- status (varchar) -- paid, pending, failed, etc.
- payment_method_id (varchar) -- pix, credit_card, etc.
- payment_type_id (varchar)
- payment_data (json) -- Dados completos do MercadoPago
- paid_at (timestamp)
- created_at, updated_at
```

## Status de Pagamento

### Status Internos:
- **pending**: Aguardando pagamento
- **paid**: Pagamento aprovado
- **failed**: Pagamento rejeitado
- **cancelled**: Pagamento cancelado
- **processing**: Processando
- **refunded**: Estornado

### Mapeamento MercadoPago:
- `approved` → `paid`
- `pending` → `pending`
- `in_process` → `processing`
- `rejected` → `failed`
- `cancelled` → `cancelled`
- `refunded` → `refunded`

## Funcionalidades Implementadas

### ✅ Sistema de Pagamento
- [x] Integração completa com MercadoPago
- [x] Suporte a PIX, cartão, boleto
- [x] Redirecionamento automático
- [x] Páginas de sucesso e erro
- [x] Webhooks para atualização de status

### ✅ Sistema de Clientes
- [x] Cadastro de clientes
- [x] Login e logout
- [x] Autenticação com tokens
- [x] Perfil do cliente
- [x] Histórico de pedidos

### ✅ Gestão de Pedidos
- [x] Criação de pedidos
- [x] Controle de estoque
- [x] Cálculo de frete
- [x] Histórico completo
- [x] Status em tempo real

### ✅ Interface Moderna
- [x] Design responsivo
- [x] UX otimizada
- [x] Formulários validados
- [x] Feedback visual
- [x] Navegação intuitiva

## Monitoramento e Logs

### Logs do Laravel
```bash
tail -f /workspace/backend/storage/logs/laravel.log
```

### Verificar Pagamentos
```sql
SELECT * FROM payments ORDER BY created_at DESC;
SELECT * FROM orders WHERE payment_status = 'paid';
```

### Debug MercadoPago
- Acesse o painel: https://www.mercadopago.com.br/developers/panel
- Vá em "Atividade" para ver transações
- Verifique webhooks em "Webhooks"

## Produção

### Checklist para Deploy:

1. **Configurações**:
   - [ ] Alterar `MERCADOPAGO_SANDBOX=false`
   - [ ] Usar credenciais de produção
   - [ ] Configurar domínio real
   - [ ] SSL habilitado

2. **Segurança**:
   - [ ] Validar webhooks
   - [ ] Rate limiting
   - [ ] Logs de auditoria
   - [ ] Backup do banco

3. **Monitoramento**:
   - [ ] Alertas de falha
   - [ ] Métricas de conversão
   - [ ] Logs centralizados
   - [ ] Health checks

## Suporte

### Documentação MercadoPago:
- https://www.mercadopago.com.br/developers/pt/docs
- https://github.com/mercadopago/dx-php

### Contatos:
- Suporte Técnico: developers@mercadopago.com
- Documentação: https://www.mercadopago.com.br/developers/pt/support

---

**Nota**: Este sistema está pronto para produção, mas recomenda-se testes extensivos em ambiente de sandbox antes do deploy final.