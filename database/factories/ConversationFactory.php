<?php

namespace Database\Factories;

use App\Enums\ConversationType;
use App\Models\Conversation;
use App\Models\Participant;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state: a group with no members yet.
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

    /**
     * A direct chat between two users. Passing the same user twice makes a chat with yourself.
     *
     * Stores the pair with the smaller id first and creates the membership rows
     * the real app would create (one row for a chat with yourself, two otherwise).
     */
    public function direct(User $first, User $second, ?CarbonInterface $startedAt = null): static
    {
        $startedAt ??= now();

        return $this->state(fn (array $attributes) => [
            'type' => ConversationType::Direct,
            'direct_user_low_id' => min($first->id, $second->id),
            'direct_user_high_id' => max($first->id, $second->id),
            'created_at' => $startedAt,
            'updated_at' => $startedAt,
        ])->afterCreating(function (Conversation $conversation) use ($first, $second, $startedAt) {
            $members = $first->is($second) ? [$first] : [$first, $second];

            foreach ($members as $member) {
                Participant::factory()
                    ->for($conversation)
                    ->for($member)
                    ->joinedAt($startedAt)
                    ->create();
            }
        });
    }
}