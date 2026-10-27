<?php

namespace App\Models;
use Database\Factories\ConversationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use App\Enums\ConversationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property ConversationType $type
 * @property int|null $direct_user_low_id
 * @property int|null $direct_user_high_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['type', 'direct_user_low_id', 'direct_user_high_id'])]
class Conversation extends Model
{
        /** @use HasFactory<ConversationFactory> */
    use HasFactory;

    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ConversationType::class,
        ];
    }

    /**
     * The membership rows of this conversation.
     *
     * @return HasMany<Participant, $this>
     */
    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * The messages of this conversation.
     *
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

        /**
     * The title this viewer sees in their chat list.
     *
     * Direct chat: the other person's name (your own name for a chat with yourself).
     * Group: the other current members' names, up to three, until Phase 6 adds a real name.
     * Expects `participants.user` to be loaded; otherwise it queries lazily, one chat at a time.
     */
    public function titleFor(User $viewer): string
    {
        $others = $this->participants->where('user_id', '!=', $viewer->id);

        if ($this->type === ConversationType::Direct) {
            return $others->first()?->user->name ?? $viewer->name.' (You)';
        }

        $names = $others->whereNull('left_at')->pluck('user.name');

        if ($names->isEmpty()) {
            return 'Group';
        }

        $extra = $names->count() - 3;
        $shown = $names->take(3)->implode(', ');

        return $extra > 0 ? "{$shown} +{$extra}" : $shown;
    }
}