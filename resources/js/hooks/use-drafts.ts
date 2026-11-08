import { useState } from "react";

/** Each chat's half-written message, kept while you move between chats. */
export function useDrafts() {
    // chat id -> text. Partial means a chat may have no entry yet.
    const [drafts, setDrafts] = useState<Partial<Record<number, string>>>({});

    function get(chatId: number): string {
        return drafts[chatId] ?? "";
    }

    function set(chatId: number, text: string) {
        setDrafts((current) => ({ ...current, [chatId]: text }));
    }

    return { get, set };
}
