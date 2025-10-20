# Teste da Integração Mercado Pago

## Problemas Identificados e Correções Realizadas

### 1. Problema: Carrinho vazio durante checkout
**Causa:** Problemas de sessão entre frontend e backend
**Correção:** 
- Melhorada inicialização de sessão no CartController
- Adicionado tratamento de erro mais robusto no CartContext
- Configurado CORS adequadamente para suportar credenciais

### 2. Problema: Formato de data inválido
**Causa:** Data vinda do banco em formato datetime sendo usada em input type="date"
**Correção:** 
- Adicionada conversão de formato de data no Profile.tsx
- Data agora é convertida para YYYY-MM-DD antes de ser exibida no input

### 3. Problema: Configuração de sessão inadequada para CORS
**Causa:** SameSite=lax não funciona bem com requests cross-origin
**Correção:**
- Alterado SESSION_SAME_SITE para 'none' no config/session.php
- Mantido supports_credentials=true no CORS

## Passos para Testar

1. **Verificar se os containers estão rodando:**
   ```bash
   docker-compose ps
   ```

2. **Acessar a aplicação:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

3. **Testar fluxo completo:**
   - Navegar para produtos
   - Adicionar produtos ao carrinho
   - Ir para o checkout
   - Preencher dados de entrega
   - Selecionar forma de pagamento (cartão de crédito)
   - Usar dados de teste do Mercado Pago:
     - Cartão: 4235 6477 2802 5682
     - Nome: APRO (para aprovação automática)
     - Vencimento: 11/25
     - CVV: 123

4. **Verificar logs em caso de erro:**
   ```bash
   # Backend logs
   docker-compose logs backend
   
   # Frontend logs (no console do navegador)
   # Abrir DevTools > Console
   ```

## Cartões de Teste Mercado Pago

### Cartões para Aprovação
- **Visa:** 4235 6477 2802 5682
- **Mastercard:** 5031 4332 1540 6351
- **American Express:** 3711 803032 57522

### Nomes para Diferentes Status
- **APRO:** Pagamento aprovado
- **CONT:** Pagamento pendente
- **CALL:** Recusado, ligar para autorizar
- **FUND:** Recusado por saldo insuficiente
- **SECU:** Recusado por código de segurança
- **EXPI:** Recusado por data de vencimento
- **FORM:** Recusado por erro no formulário

### CVV e Vencimento
- **CVV:** Qualquer código de 3 dígitos
- **Vencimento:** Qualquer data futura

## Endpoints de Debug

- **Verificar sessão:** GET /api/debug/session
- **Verificar carrinho:** GET /api/cart
- **Token CSRF:** GET /api/csrf-token

## Arquivos Modificados

1. `frontend/src/contexts/CartContext.tsx` - Melhor tratamento de sessão
2. `frontend/src/pages/Checkout.tsx` - Validação de carrinho e melhor UX
3. `frontend/src/pages/Profile.tsx` - Correção formato de data
4. `frontend/src/services/api.ts` - Melhor logging de erros
5. `backend/config/cors.php` - Adicionado localhost:3001
6. `backend/config/session.php` - SESSION_SAME_SITE=none
7. `backend/app/Http/Controllers/Api/CartController.php` - Melhor tratamento de sessão
8. `backend/app/Http/Controllers/Api/OrderController.php` - Mensagens de erro mais claras
9. `backend/routes/api.php` - Endpoint de debug de sessão
10. `backend/.env` - Arquivo de configuração completo