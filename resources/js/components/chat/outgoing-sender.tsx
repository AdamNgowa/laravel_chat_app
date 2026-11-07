import { router, useHttp } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { send as sendMessage } from "@/routes/chats";
import type {
    OutgoingMessage,
    SendMessageData,
    SendMessageResponse,
} from "@/types";

function failureText(status: number): string {
    switch (status) {
        case 403:
            return "You can no longer send messages to this chat";

        case 429:
            return "You are sending to much. wait a moment then press retry";
        default:
            return "Could'nt send";
    }
}

type Props = {
    item: OutgoingMessage;
    // True only for the oldest unsent message of its chat, so messages reach the server in order.
    canStart: boolean;
    // The chat on screen right now (null when only the list is showing).
    activeChatId: number | null;
    onSent: (uuid: string) => void;
    onFailed: (uuid: string, error: string) => void;
};

/**
 * Sends one pending message. It draws nothing. It exists because each request
 * needs its own useHttp, and hooks cannot be called in a loop, so every
 * pending message gets its own small component.
 */
export function OutgoingSender({
    item,
    canStart,
    activeChatId,
    onSent,
    onFailed,
}: Props) {
    const { post } = useHttp<SendMessageData, SendMessageResponse>({
        body: item.body,
        client_uuid: item.client_uuid,
    });

    // A reply can arrive after the person has moved to another chat.
    const shownChatId = useRef(activeChatId);
    const inFlight = useRef(false);

    useEffect(() => {
        shownChatId.current = activeChatId;
    }, [activeChatId]);

    useEffect(() => {
        if (!canStart || item.status !== "sending" || inFlight.current) {
            return;
        }

        inFlight.current = true;

        post(sendMessage.url(item.chat_id), {
            onSuccess: ({ message }) => {
                // On another chat: the message is saved and shows when they return.
                if (shownChatId.current === item.chat_id) {
                    router.prependToProp("messages.data", message);
                }

                onSent(item.client_uuid);
                router.reload({ only: ["chats"] });
            },
            onError: (errors) => {
                onFailed(
                    item.client_uuid,
                    errors.body ?? "This message was rejected.",
                );
            },
            onHttpException: (response) => {
                onFailed(item.client_uuid, failureText(response.status));
            },
            onNetworkError: () => {
                onFailed(item.client_uuid, "Couldn't reach the server.");
            },
            onFinish: () => {
                inFlight.current = false;
            },
        }).catch(() => {
            // The callbacks above already handled every kind of failure; this only
            // stops the console's "Uncaught (in promise)" for the same error.
        });
    }, [canStart, item.status]);

    return null;
}
