<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cpf')->unique()->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('telefone')->nullable();
            $table->string('uf', 2)->nullable();
            $table->string('estado')->nullable();
            $table->text('endereco')->nullable();
            $table->string('complemento')->nullable();
            $table->string('cep', 10)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'cpf',
                'data_nascimento',
                'telefone',
                'uf',
                'estado',
                'endereco',
                'complemento',
                'cep'
            ]);
        });
    }
};