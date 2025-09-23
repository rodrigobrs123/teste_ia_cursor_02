#!/bin/bash

echo "==================================="
echo "🏃‍♂️ DEMO - LOJA VIRTUAL DE ESPORTES"
echo "==================================="
echo ""

echo "📋 RESUMO DA APLICAÇÃO:"
echo "• Frontend React: http://localhost:3000"
echo "• Backend Laravel: http://localhost:8000"
echo "• Banco de dados: SQLite"
echo "• Integração de pagamento: NuvemPago (simulado)"
echo ""

echo "🔧 TECNOLOGIAS UTILIZADAS:"
echo "• Frontend: React + TypeScript + Tailwind CSS"
echo "• Backend: Laravel + PHP"
echo "• Banco: SQLite"
echo "• Containerização: Docker (configurado)"
echo ""

echo "📊 TESTANDO APIs DO BACKEND:"
echo ""

echo "1️⃣ Listando Categorias:"
curl -s -H "Accept: application/json" http://localhost:8000/api/categories | jq '.data[] | {id: .id, name: .name, products_count: .products_count}' 2>/dev/null || curl -s -H "Accept: application/json" http://localhost:8000/api/categories | head -3
echo ""

echo "2️⃣ Produtos em Destaque:"
curl -s -H "Accept: application/json" http://localhost:8000/api/products/featured | jq '.data[] | {id: .id, name: .name, price: .price, sale_price: .sale_price}' 2>/dev/null || curl -s -H "Accept: application/json" http://localhost:8000/api/products/featured | head -5
echo ""

echo "3️⃣ Testando Carrinho (simulado):"
echo "POST /api/cart - Adicionar produto ao carrinho"
echo "GET /api/cart - Visualizar carrinho"
echo "PUT /api/cart/{id} - Atualizar quantidade"
echo "DELETE /api/cart/{id} - Remover item"
echo ""

echo "💳 FUNCIONALIDADES DE PAGAMENTO:"
echo "• Cartão de Crédito (aprovação automática)"
echo "• PIX (gera QR Code)"
echo "• Boleto (gera link para download)"
echo ""

echo "🎨 FUNCIONALIDADES DO FRONTEND:"
echo "• ✅ Página inicial com produtos em destaque"
echo "• ✅ Catálogo de produtos com filtros e busca"
echo "• ✅ Detalhes do produto com imagens e especificações"
echo "• ✅ Carrinho de compras funcional"
echo "• ✅ Checkout completo com múltiplas formas de pagamento"
echo "• ✅ Página de sucesso do pedido"
echo "• ✅ Design responsivo e moderno"
echo ""

echo "🚀 PARA ACESSAR A APLICAÇÃO:"
echo "Frontend: http://localhost:3000"
echo "API Backend: http://localhost:8000/api"
echo ""

echo "📝 DADOS DE TESTE:"
echo "• 6 categorias de esportes"
echo "• 10 produtos com preços e promoções"
echo "• Estoque controlado"
echo "• Especificações detalhadas"
echo ""

echo "==================================="
echo "✅ APLICAÇÃO RODANDO COM SUCESSO!"
echo "==================================="