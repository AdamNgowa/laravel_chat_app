<?php

namespace App\Actions\Chat;

use App\Enums\ConversationType;
use App\Models\Conversation;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * The one place that knows how a direct chat is built. The seeder and the
 * "start a chat" feature both call it, so they can never disagree.
 */
class StartDirectChat
{
    /**
     * Find the direct chat between two people, or create it.
     * Asking for (A, B) or (B, A) gives the same chat. Passing the same user
     * twice gives that user's chat with themselves (the seeder uses this; the
     * real feature does not allow it).
     *
     * $startedAt exists for the seeder, which backdates chats. Real use leaves it null.
     */
    public function handle(User $first, User $second, ?CarbonInterface $startedAt = null): Conversation
    {
        // The smaller id always goes first, so the pair has only one spelling.
        [$low, $high] = $first->id <= $second->id
            ? [$first, $second]
            : [$second, $first];

        $existing = $this->find($low, $high);

        if ($existing !== null) {
            return $existing;
        }

        try {
            return DB::transaction(
                fn () => $this->create($low, $high, $startedAt ?? now()),
            );
        } catch (UniqueConstraintViolationException $e) {
            // Another request created the same chat between our look and our insert.
            // The database refused ours, so use the one that won.
            return $this->find($low, $high) ?? throw $e;
        }
    }

    private function find(User $low, User $high): ?Conversation
    {
        // Only direct chats have these two columns filled in, so no type check is needed.
        return Conversation::query()
            ->where('direct_user_low_id', $low->id)
            ->where('direct_user_high_id', $high->id)
            ->first();
    }

    private function create(User $low, User $high, CarbonInterface $at): Conversation
    {
        $conversation = new Conversation([
            'type' => ConversationType::Direct,
            'direct_user_low_id' => $low->id,
            'direct_user_high_id' => $high->id,
        ]);

        // Set by hand so a backdated chat starts when we say it did.
        $conversation->created_at = $at;
        $conversation->updated_at = $at;
        $conversation->save();

        // One row per person: a chat with yourself has only one member.
        // is() asks are these records in the same database row.
        $members = $low->is($high) ? [$low] : [$low, $high];

        foreach ($members as $member) {
            $conversation->participants()->create([
                'user_id' => $member->id,
                'joined_at' => $at,
            ]);
        }

        return $conversation;
    }
}