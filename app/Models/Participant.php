<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $conversation_id
 * @property int $user_id
 * @property Carbon $joined_at
 * @property Carbon|null $left_at
 * @property Carbon|null $cleared_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'joined_at', 'left_at', 'cleared_at'])]
class Participant extends Model
{
    /** @use HasFactory<ParticipantFactory> */
    use HasFactory;

    /**
     * Store dates in microseconds. Messages are ordered and compared with a 
     * member's visibility window, and whole seconds are not precise enough
     */
    protected $dateFormat = 'Y-m-d H:i:s.u';

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
            'cleared_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    

        /**
     * The messages this member is allowed to see.
     *
     * Visible only after the later of joined_at and cleared_at and, once the
     * member has left, only before left_at. Ties are hidden on purpose.
     * Boundaries are formatted by hand so the query keeps the microseconds.
     *
     * @return HasMany<Message, $this>
     */
    public function visibleMessages(): HasMany
    {
        // One format for every boundary: Y-m-d H:i:s.u (i = minutes, m = month).
        $format = 'Y-m-d H:i:s.u';

        $start = $this->cleared_at !== null && $this->cleared_at->greaterThan($this->joined_at)
            ? $this->cleared_at
            : $this->joined_at;

        $messages = $this->hasMany(Message::class, 'conversation_id', 'conversation_id')
            ->where('created_at', '>', $start->format($format));

        if ($this->left_at !== null) {
            $messages->where('created_at', '<', $this->left_at->format($format));
        }

        return $messages;
    }
}