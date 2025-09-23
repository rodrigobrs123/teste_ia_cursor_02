<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $futebolCategory = Category::where('slug', 'futebol')->first();
        $basqueteCategory = Category::where('slug', 'basquete')->first();
        $tenisCategory = Category::where('slug', 'tenis')->first();
        $corridaCategory = Category::where('slug', 'corrida')->first();
        $academiaCategory = Category::where('slug', 'academia')->first();
        $natacaoCategory = Category::where('slug', 'natacao')->first();

        $products = [
            // Futebol
            [
                'name' => 'Chuteira Nike Mercurial Vapor 15',
                'slug' => 'chuteira-nike-mercurial-vapor-15',
                'description' => 'Chuteira profissional para futebol de campo com travas de alumínio e cabedal em couro sintético de alta qualidade.',
                'short_description' => 'Chuteira profissional Nike para futebol de campo',
                'price' => 459.90,
                'sale_price' => 399.90,
                'sku' => 'CHU-NIKE-001',
                'stock' => 50,
                'images' => ['/images/products/chuteira-nike-1.jpg', '/images/products/chuteira-nike-2.jpg'],
                'brand' => 'Nike',
                'specifications' => ['Material: Couro sintético', 'Travas: Alumínio', 'Indicado para: Campo'],
                'category_id' => $futebolCategory->id,
                'active' => true,
                'featured' => true
            ],
            [
                'name' => 'Bola Futebol Adidas Tango',
                'slug' => 'bola-futebol-adidas-tango',
                'description' => 'Bola oficial de futebol Adidas Tango, aprovada pela FIFA para jogos profissionais.',
                'short_description' => 'Bola oficial FIFA Adidas Tango',
                'price' => 89.90,
                'sku' => 'BOL-ADS-001',
                'stock' => 30,
                'images' => ['/images/products/bola-adidas-1.jpg'],
                'brand' => 'Adidas',
                'specifications' => ['Tamanho: 5', 'Material: Couro sintético', 'Aprovação: FIFA'],
                'category_id' => $futebolCategory->id,
                'active' => true,
                'featured' => false
            ],

            // Basquete
            [
                'name' => 'Tênis Nike Air Jordan 1',
                'slug' => 'tenis-nike-air-jordan-1',
                'description' => 'Tênis clássico de basquete Nike Air Jordan 1, ideal para quadra e uso casual.',
                'short_description' => 'Tênis clássico Nike Air Jordan 1',
                'price' => 899.90,
                'sale_price' => 749.90,
                'sku' => 'TEN-NIKE-002',
                'stock' => 25,
                'images' => ['/images/products/jordan-1-1.jpg', '/images/products/jordan-1-2.jpg'],
                'brand' => 'Nike',
                'specifications' => ['Material: Couro', 'Solado: Borracha', 'Tipo: Cano alto'],
                'category_id' => $basqueteCategory->id,
                'active' => true,
                'featured' => true
            ],
            [
                'name' => 'Bola de Basquete Spalding NBA',
                'slug' => 'bola-basquete-spalding-nba',
                'description' => 'Bola oficial da NBA, fabricada pela Spalding com couro sintético de alta qualidade.',
                'short_description' => 'Bola oficial NBA Spalding',
                'price' => 129.90,
                'sku' => 'BOL-SPA-001',
                'stock' => 40,
                'images' => ['/images/products/bola-spalding-1.jpg'],
                'brand' => 'Spalding',
                'specifications' => ['Tamanho: 7', 'Material: Couro sintético', 'Oficial: NBA'],
                'category_id' => $basqueteCategory->id,
                'active' => true,
                'featured' => false
            ],

            // Tênis
            [
                'name' => 'Raquete Wilson Pro Staff 97',
                'slug' => 'raquete-wilson-pro-staff-97',
                'description' => 'Raquete profissional Wilson Pro Staff 97, usada pelos melhores tenistas do mundo.',
                'short_description' => 'Raquete profissional Wilson Pro Staff 97',
                'price' => 1299.90,
                'sku' => 'RAQ-WIL-001',
                'stock' => 15,
                'images' => ['/images/products/raquete-wilson-1.jpg'],
                'brand' => 'Wilson',
                'specifications' => ['Peso: 315g', 'Tamanho da cabeça: 97 pol²', 'Padrão de cordas: 16x19'],
                'category_id' => $tenisCategory->id,
                'active' => true,
                'featured' => true
            ],

            // Corrida
            [
                'name' => 'Tênis Nike Air Zoom Pegasus 40',
                'slug' => 'tenis-nike-air-zoom-pegasus-40',
                'description' => 'Tênis de corrida Nike com tecnologia Air Zoom para máximo conforto e performance.',
                'short_description' => 'Tênis de corrida Nike Air Zoom Pegasus 40',
                'price' => 699.90,
                'sale_price' => 599.90,
                'sku' => 'TEN-NIKE-003',
                'stock' => 60,
                'images' => ['/images/products/pegasus-40-1.jpg', '/images/products/pegasus-40-2.jpg'],
                'brand' => 'Nike',
                'specifications' => ['Tecnologia: Air Zoom', 'Drop: 10mm', 'Peso: 280g'],
                'category_id' => $corridaCategory->id,
                'active' => true,
                'featured' => true
            ],
            [
                'name' => 'Relógio Garmin Forerunner 255',
                'slug' => 'relogio-garmin-forerunner-255',
                'description' => 'Relógio GPS para corrida com monitoramento avançado de performance e saúde.',
                'short_description' => 'Relógio GPS Garmin Forerunner 255',
                'price' => 2199.90,
                'sku' => 'REL-GAR-001',
                'stock' => 20,
                'images' => ['/images/products/garmin-255-1.jpg'],
                'brand' => 'Garmin',
                'specifications' => ['GPS: Sim', 'Bateria: 14 dias', 'Resistência: 5 ATM'],
                'category_id' => $corridaCategory->id,
                'active' => true,
                'featured' => false
            ],

            // Academia
            [
                'name' => 'Halteres Ajustáveis 24kg',
                'slug' => 'halteres-ajustaveis-24kg',
                'description' => 'Par de halteres ajustáveis de 2,5kg a 24kg cada, ideais para treino em casa.',
                'short_description' => 'Halteres ajustáveis 2,5kg a 24kg',
                'price' => 899.90,
                'sku' => 'HAL-ADJ-001',
                'stock' => 10,
                'images' => ['/images/products/halteres-1.jpg'],
                'brand' => 'PowerTech',
                'specifications' => ['Peso: 2,5kg a 24kg', 'Material: Ferro fundido', 'Ajuste: Rápido'],
                'category_id' => $academiaCategory->id,
                'active' => true,
                'featured' => true
            ],

            // Natação
            [
                'name' => 'Óculos de Natação Speedo',
                'slug' => 'oculos-natacao-speedo',
                'description' => 'Óculos de natação profissional Speedo com lentes anti-embaçante e proteção UV.',
                'short_description' => 'Óculos de natação profissional Speedo',
                'price' => 79.90,
                'sku' => 'OCU-SPE-001',
                'stock' => 80,
                'images' => ['/images/products/oculos-speedo-1.jpg'],
                'brand' => 'Speedo',
                'specifications' => ['Proteção UV: Sim', 'Anti-embaçante: Sim', 'Ajustável: Sim'],
                'category_id' => $natacaoCategory->id,
                'active' => true,
                'featured' => false
            ],
            [
                'name' => 'Prancha de Natação Kickboard',
                'slug' => 'prancha-natacao-kickboard',
                'description' => 'Prancha de natação para treino de pernas, feita em EVA de alta densidade.',
                'short_description' => 'Prancha de natação para treino',
                'price' => 49.90,
                'sku' => 'PRA-KIC-001',
                'stock' => 35,
                'images' => ['/images/products/prancha-1.jpg'],
                'brand' => 'AquaTech',
                'specifications' => ['Material: EVA', 'Densidade: Alta', 'Flutuação: Excelente'],
                'category_id' => $natacaoCategory->id,
                'active' => true,
                'featured' => false
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
