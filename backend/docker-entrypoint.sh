#!/bin/bash
set -e

# Aguardar o banco de dados estar disponível
echo "Aguardando banco de dados..."
until mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
  echo "Banco de dados ainda não está pronto..."
  sleep 5
done

echo "Banco de dados conectado!"

# Verificar se as tabelas já existem
TABLES_EXIST=$(mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -D"$DB_DATABASE" -e "SHOW TABLES;" 2>/dev/null | wc -l)

if [ "$TABLES_EXIST" -gt 0 ]; then
  echo "Tabelas já existem. Executando migrations com --force..."
  # Se tabelas existem, usar migrate:fresh para recriar tudo
  php artisan migrate:fresh --force --seed
else
  echo "Executando migrations pela primeira vez..."
  # Primeira execução, executar migrations normalmente
  php artisan migrate --force
  # Executar seeders
  php artisan db:seed --force
fi

echo "Migrations e seeders executados com sucesso!"

# Executar comando passado como parâmetro
exec "$@"