# Testing Guide for E-commerce Application

## Prerequisites
1. Make sure both backend and frontend are running
2. Backend should be accessible at http://localhost:8000
3. Frontend should be accessible at http://localhost:3000

## Test Cases

### 1. User Registration Test
- Navigate to http://localhost:3000/register
- Fill in all required fields:
  - Nome: João Silva
  - CPF: 123.456.789-00
  - Data de Nascimento: 1990-01-01
  - Telefone: (11) 99999-9999
  - Email: joao@example.com
  - Password: 12345678
  - Confirm Password: 12345678
  - UF: SP (São Paulo)
  - Endereço: Rua das Flores, 123
  - CEP: 01234-567
- Click "Criar conta"
- Should redirect to home page with user logged in

### 2. Login/Logout Test
- Navigate to http://localhost:3000/login
- Enter credentials:
  - Email: joao@example.com
  - Password: 12345678
- Click "Entrar"
- Should see user name in header
- Click on user dropdown and select "Sair"
- Should be logged out

### 3. Product Search Test
- Navigate to http://localhost:3000/products
- Use search bar in header to search for products
- Try different search terms
- Verify results are filtered correctly

### 4. Add to Cart Test
- Navigate to a product detail page
- Select quantity
- Click "Adicionar ao Carrinho"
- Check cart icon shows item count
- Navigate to cart page to verify item is there

### 5. Checkout Test
- Add items to cart
- Navigate to cart
- Click "Finalizar Compra"
- Fill in shipping information
- Select payment method (use fake credit card data)
- Complete purchase
- Should redirect to success page

### 6. User Profile Test
- Login as user
- Navigate to profile page
- Check that user information is displayed
- Check order history (if any orders exist)

## Expected Behavior
- All forms should validate properly
- Error messages should be clear and helpful
- Navigation should work smoothly
- Cart should persist items
- Search should return relevant results
- User authentication should work properly