<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /** How many messages one page holds. */
    private const PAGE_SIZE = 50;

    /**
     * The chat list with no chat open.
     */
    public function index(Request $request): Response
    {
        $viewer = $request->user();

        return Inertia::render('chats/index', [
            'chats' => fn () => $this->chatList($viewer),
            'activeChat' => null,
            'messages' => null,
        ]);
    }

    /**
     * The chat list with one chat open. Same page component as index(), so a
     * click on a chat can ask for just `activeChat` and `messages`.
     */
    public function show(Request $request, Conversation $conversation): Response
    {
        // Runs on every request, including the ones that only ask for older messages.
        // A stranger gets a 404 here.
        Gate::authorize('view', $conversation);

        $viewer = $request->user();

        $membership = $conversation->participants()
            ->where('user_id', $viewer->id)
            ->firstOrFail();

        return Inertia::render('chats/index', [
            'chats' => fn () => $this->chatList($viewer),
            'activeChat' => fn () => $this->activeChat($viewer, $conversation),
            'messages' => Inertia::scroll(fn () => $this->messagePage($viewer, $membership)),
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function chatList(User $viewer): Collection
    {
        return $viewer->participants()
            ->with('conversation.participants.user')
            ->get()
            ->map(fn (Participant $membership) => $this->summary($viewer, $membership))
            ->sortByDesc('last_activity_at')
            ->values();
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

    /**
     * The open chat's header data. The messages are a separate prop.
     *
     * @return array<string, mixed>
     */
    private function activeChat(User $viewer, Conversation $conversation): array
    {
        $conversation->loadMissing('participants.user');

        return [
            'id' => $conversation->id,
            'type' => $conversation->type->value,
            'title' => $conversation->titleFor($viewer),
            'can_send' => Gate::allows('send', $conversation),
        ];
    }

    /**
     * One page of the viewer's visible messages, newest first. A cursor means
     * "older than the last message you already have", so new messages arriving
     * between two requests cannot shift the pages.
     *
     * @return CursorPaginator<int, array<string, mixed>>
     */
    private function messagePage(User $viewer, Participant $membership): CursorPaginator
    {
        return $membership->visibleMessages()
            ->with('sender:id,name')
            ->latest('id')
            ->cursorPaginate(self::PAGE_SIZE)
            ->through(fn (Message $message) => $this->messageData($viewer, $message));
    }

    /**
     * @return array<string, mixed>
     */
    private function messageData(User $viewer, Message $message): array
    {
        return [
            'id' => $message->id,
            'type' => $message->type->value,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'is_mine' => $message->sender_id === $viewer->id,
            'created_at' => $message->created_at,
            'edited_at' => $message->edited_at,
        ];
    }
}