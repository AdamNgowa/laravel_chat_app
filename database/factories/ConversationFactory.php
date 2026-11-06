<?php

namespace Database\Factories;

use App\Enums\ConversationType;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state: a group with no members yet.
     *
     * Direct chats are not built here. App\Actions\Chat\StartDirectChat is the
     * one place that knows how, so tests and the seeder call it.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => ConversationType::Group,
            'direct_user_low_id' => null,
            'direct_user_high_id' => null,
        ];
    }
}