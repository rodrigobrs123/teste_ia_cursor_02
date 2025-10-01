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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->string('payment_id')->unique(); // MercadoPago payment ID
            $table->string('preference_id')->nullable(); // MercadoPago preference ID
            $table->string('external_reference'); // Order reference
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('BRL');
            $table->string('status'); // paid, pending, failed, cancelled, etc.
            $table->string('payment_method_id')->nullable(); // pix, credit_card, etc.
            $table->string('payment_type_id')->nullable(); // account_money, credit_card, etc.
            $table->json('payment_data')->nullable(); // Full payment response from MercadoPago
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index('external_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
