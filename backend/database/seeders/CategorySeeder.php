<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        $categories = [
            [
                'name' => 'Futebol',
                'slug' => 'futebol',
                'description' => 'Equipamentos e acessórios para futebol',
                'image' => '/images/categories/futebol.jpg',
                'active' => true
            ],
            [
                'name' => 'Basquete',
                'slug' => 'basquete',
                'description' => 'Produtos para basquete e streetball',
                'image' => '/images/categories/basquete.jpg',
                'active' => true
            ],
            [
                'name' => 'Tênis',
                'slug' => 'tenis',
                'description' => 'Equipamentos para tênis',
                'image' => '/images/categories/tenis.jpg',
                'active' => true
            ],
            [
                'name' => 'Corrida',
                'slug' => 'corrida',
                'description' => 'Produtos para corrida e atletismo',
                'image' => '/images/categories/corrida.jpg',
                'active' => true
            ],
            [
                'name' => 'Academia',
                'slug' => 'academia',
                'description' => 'Equipamentos para academia e musculação',
                'image' => '/images/categories/academia.jpg',
                'active' => true
            ],
            [
                'name' => 'Natação',
                'slug' => 'natacao',
                'description' => 'Produtos para natação e esportes aquáticos',
                'image' => '/images/categories/natacao.jpg',
                'active' => true
            ]
        ];

        foreach ($categories as $category) {

            Category::updateOrCreate($category);
           // Category::create($category);
        }
    }
}
