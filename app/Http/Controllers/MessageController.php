<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    /**
     * Save a text message from the signed-in user. Safe to retry: sending the same
     * client_uuid again returns the message already saved instead of making a second.
     */
    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $sender = $request->user();
        $clientUuid = $request->validated('client_uuid');

        $existing = $this->findExisting($sender, $clientUuid);

        if ($existing !== null) {
            // The same uuid used for a different chat is a client bug, not a retry.
            abort_if($existing->conversation_id !== $conversation->id, 409, 'This message id was already used.');

            return $this->respond($existing, 200);
        }

        // type, sender and chat come from OUR code, never from the request body.
        $message = $conversation->messages()->make([
            'type' => MessageType::Text,
            'body' => $request->validated('body'),
            'client_uuid' => $clientUuid,
        ]);
        $message->sender()->associate($sender);

        try {
            $message->save();
        } catch (UniqueConstraintViolationException $e) {
            // Two retries raced; the other one won. Return theirs.
            $existing = $this->findExisting($sender, $clientUuid) ?? throw $e;

            return $this->respond($existing, 200);
        }

        $message->setRelation('sender', $sender);

        return $this->respond($message, 201);
    }

    private function findExisting(User $sender, string $clientUuid): ?Message
    {
        return Message::query()
            ->where('sender_id', $sender->id)
            ->where('client_uuid', $clientUuid)
            ->with('sender:id,name')
            ->first();
    }

    private function respond(Message $message, int $status): JsonResponse
    {
        return response()->json(
            ['message' => MessageResource::make($message)->resolve()],
            $status,
        );
    }
}