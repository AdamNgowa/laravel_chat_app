<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ConversationPolicy
{
    /**
     * May the user open this conversation and read their window of it?
     * Non-members get a 404, so the conversation's existence stays hidden.
     */
    public function view(User $user, Conversation $conversation): Response
    {
        return $this->membership($user, $conversation) !== null
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    /**
     * May the user post in this conversation?
     * A member who left can still read but not post: a 403, since they already know it exists.
     */
    public function send(User $user, Conversation $conversation): Response
    {
        $membership = $this->membership($user, $conversation);

        if ($membership === null) {
            return Response::denyAsNotFound();
        }

        return $membership->left_at === null
            ? Response::allow()
            : Response::deny('You are no longer a member of this conversation.');
    }

    /**
     * The user's membership row in this conversation, or null if they have none.
     */
    private function membership(User $user, Conversation $conversation): ?Participant
    {
        return $conversation->participants()->where('user_id', $user->id)->first();
    }
}