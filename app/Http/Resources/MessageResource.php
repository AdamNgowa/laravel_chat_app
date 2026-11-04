<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * How a message is sent to the browser. Expects `sender` to be loaded.
 *
 * @mixin Message
 */
class MessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isMine = $this->sender_id === $request->user()->id;
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'body' => $this->body,
            'sender_id' => $this->sender_id,
            'sender_name' => $this->sender->name,
            'is_mine' => $isMine,
            //Only the sender needs this id, to a match a pending bubble to its saved message.
            'client_uuid' => $isMine ? $this->client_uuid : null,
            'created_at' => $this->created_at,
            'edited_at' => $this->edited_at,
        ];
    }
}