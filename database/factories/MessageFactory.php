<?php

namespace Database\Factories;

use App\Enums\MessageType;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state: a text message.
     *
     * Used on its own this builds a state the real app cannot reach (the sender is
     * not a member of the new conversation). Always attach real ones with for():
     * ->for($conversation)->for($sender, 'sender').
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'sender_id' => User::factory(),
            'type' => MessageType::Text,
            'body' => fake()->sentence(),
            'reply_to_id' => null,
            'client_uuid' => fake()->uuid(),
            'edited_at' => null,
        ];
    }

    public function system(string $body): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => MessageType::System,
            'body' => $body,
            'client_uuid' => null,
        ]);
    }

    public function sentAt(CarbonInterface $at): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }

    public function replyingTo(Message $original): static
    {
        return $this->state(fn (array $attributes) => ['reply_to_id' => $original->id]);
    }
}