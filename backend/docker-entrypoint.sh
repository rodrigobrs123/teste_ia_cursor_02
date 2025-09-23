#!/bin/bash
set -e

# Aguardar o banco de dados estar disponível
until php artisan migrate:status > /dev/null 2>&1; do
  echo "Aguardando banco de dados..."
  sleep 2
done

# Executar migrations
php artisan migrate --force

# Executar seeders
php artisan db:seed --force

# Executar comando passado como parâmetro
exec "$@"