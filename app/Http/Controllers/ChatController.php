<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * The viewer's chat list, newest activity first.
     */
    public function index(Request $request): Response
    {
        $viewer = $request->user();

        $chats = $viewer->participants()
            ->with('conversation.participants.user')
            ->get()
            ->map(fn (Participant $membership) => $this->summary($viewer, $membership))
            ->sortByDesc('last_activity_at')
            ->values();

        return Inertia::render('chats/index', ['chats' => $chats]);
    }

    /**
     * One row of the chat list. The preview comes only from messages this
     * viewer may see, so a cleared or left chat never leaks a hidden one.
     * One query per chat is a known cost, fixed in Phase 14.
     *
     * @return array<string, mixed>
     */
    private function summary(User $viewer, Participant $membership): array
    {
        $conversation = $membership->conversation;

        $last = $membership->visibleMessages()
            ->with('sender:id,name')
            ->latest('id')
            ->first();

        return [
            'id' => $conversation->id,
            'type' => $conversation->type->value,
            'title' => $conversation->titleFor($viewer),
            'preview' => $last === null ? null : [
                'body' => Str::limit((string) $last->body, 120),
                'sender_name' => $last->sender->name,
                'is_mine' => $last->sender_id === $viewer->id,
                'is_system' => $last->type === MessageType::System,
            ],
            'last_activity_at' => $last?->created_at ?? $membership->joined_at,
            'has_left' => $membership->left_at !== null,
        ];
    }
}