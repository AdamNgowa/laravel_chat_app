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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            // 'direct' or 'grouped', stored never derived from participant count.
            // Cast to the ConversationType enum on the model.
            $table->string('type');

            // Direct chats only.two users smaller id first.
            // A chat with yourself has the same id on both columns.
            // Both are null for groups
            $table->foreignId('direct_user_low_id')
            ->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('direct_user_high_id')
            ->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamps();

            // At most one direct chat per users.
            // MySQL lets NULL values repeat in a unique index, so groups never collide.
            $table->unique(['direct_user_low_id', 'direct_user_high_id']);
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
