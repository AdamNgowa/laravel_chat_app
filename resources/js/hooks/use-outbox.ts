import { useState } from "react";
import type { OutgoingMessage } from "@/types";

/**
 * The messages you have written that the server has not confirmed yet.
 * Each one has its own id, made now and kept for every retry.
 */
export function useOutbox() {
    const [items, setItems] = useState<OutgoingMessage[]>([]);

    function enqueue(chatId: number, body: string) {
        setItems((current) => [
            ...current,
            {
                client_uuid: crypto.randomUUID(),
                chat_id: chatId,
                body,
                status: "sending",
                error: null,
            },
        ]);
    }

    function markFailed(uuid: string, error: string) {
        setItems((current) =>
            current.map(
                (item): OutgoingMessage =>
                    item.client_uuid === uuid
                        ? { ...item, status: "failed", error }
                        : item,
            ),
        );
    }

    function retry(uuid: string) {
        setItems((current) =>
            current.map(
                (item): OutgoingMessage =>
                    item.client_uuid === uuid
                        ? { ...item, status: "sending", error: null }
                        : item,
            ),
        );
    }

    function remove(uuid: string) {
        setItems((current) =>
            current.filter((item) => item.client_uuid !== uuid),
        );
    }

    return { items, enqueue, markFailed, retry, remove };
}
