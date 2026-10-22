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
        Schema::create('participants', function (Blueprint $table) {
            $table->id();

            // If a conversation row is ever removed, its membership rows go with it.
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();

            // Users with chats are never hard-deleted (anonymised in Phase 11).
            $table->foreignId('user_id')->constrained()->restrictOnDelete();

            // Visibility window: messages are visible from joined_at until left_at.
            // dateTime, not timestamp: a MySQL/MariaDB timestamp column can silently get a
            // default and an "on update" rule that rewrites it whenever the row changes.
            $table->dateTime('joined_at',6);
            $table->dateTime('left_at',6)->nullable();

            // "Clear chat" (Phase 9) hides everything before this moment, for this user only.
            $table->dateTime('cleared_at',6)->nullable();

            $table->timestamps(6);

            // One row per person per conversation. A self-chat has exactly one row.
            $table->unique(['conversation_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
