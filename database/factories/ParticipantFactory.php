<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Participant;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Participant>
 */
class ParticipantFactory extends Factory
{
    /**
     * Define the model's default state: a member who joined just now.
     *
     * Used on its own this creates a brand-new conversation and user.
     * Attach real ones with for(): ->for($conversation)->for($user).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'user_id' => User::factory(),
            'joined_at' => now(),
            'left_at' => null,
            'cleared_at' => null,
        ];
    }

    public function joinedAt(CarbonInterface $at): static
    {
        return $this->state(fn (array $attributes) => ['joined_at' => $at]);
    }

    public function leftAt(CarbonInterface $at): static
    {
        return $this->state(fn (array $attributes) => ['left_at' => $at]);
    }

    public function clearedAt(CarbonInterface $at): static
    {
        return $this->state(fn (array $attributes) => ['cleared_at' => $at]);
    }
}