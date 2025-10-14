#!/bin/bash

echo "🧹 Limpando containers e volumes existentes..."

# Parar todos os containers
docker-compose down

# Remover volumes (isso vai limpar o banco de dados)
docker volume rm teste_ia_cursor_02_mysql_data 2>/dev/null || true

# Remover imagens antigas para forçar rebuild
docker-compose down --rmi all --volumes --remove-orphans

echo "✅ Limpeza concluída!"

echo "🚀 Iniciando aplicação..."
docker-compose up --build -d

echo "📊 Acompanhando logs do backend..."
docker-compose logs -f backend