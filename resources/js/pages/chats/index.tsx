import { Head } from "@inertiajs/react";
import { useState } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { ChatPanel } from "@/components/chat/chat-panel";
import { OutgoingSender } from "@/components/chat/outgoing-sender";
import { SessionExpiredBanner } from "@/components/chat/session-expired-banner";
import { useOutbox } from "@/hooks/use-outbox";
import { cn } from "@/lib/utils";
import type { ActiveChat, ChatSummary, MessagePage } from "@/types";

type Props = {
    chats: ChatSummary[];
    activeChat: ActiveChat | null;
    messages: MessagePage | null;
};

export default function ChatsIndex({ chats, activeChat, messages }: Props) {
    // Lives here, not in ChatPanel, so a message still sending is not lost when
    // the panel closes (phone: back to the list) or the person opens another chat.
    const outbox = useOutbox();

    // Set when any request finds this tab signed out; cleared by a successful send.
    const [sessionExpired, setSessionExpired] = useState(false);

    // Only the oldest unsent message of each chat may send, so messages reach
    // the server in the order they were written. A failed one holds the rest back.
    const firstInChat = new Map<number, string>();

    for (const item of outbox.items) {
        if (!firstInChat.has(item.chat_id)) {
            firstInChat.set(item.chat_id, item.client_uuid);
        }
    }

    return (
        <>
            <Head title={activeChat?.title ?? "Chats"} />

            {sessionExpired && (
                <SessionExpiredBanner
                    onDismiss={() => setSessionExpired(false)}
                />
            )}

            <ChatList
                chats={chats}
                activeId={activeChat?.id ?? null}
                onSessionExpired={() => setSessionExpired(true)}
            />
            <section
                className={cn(
                    "min-w-0 flex-1 flex-col",
                    activeChat === null ? "hidden md:flex" : "flex",
                )}
            >
                {activeChat === null || messages === null ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Select a chat to start messaging
                        </p>
                    </div>
                ) : (
                    <ChatPanel
                        chat={activeChat}
                        messages={messages.data}
                        outgoing={outbox.items.filter(
                            (item) => item.chat_id === activeChat.id,
                        )}
                        onSend={(body) => outbox.enqueue(activeChat.id, body)}
                        onRetry={outbox.retry}
                        onDiscard={outbox.remove}
                    />
                )}
            </section>

            {outbox.items.map((item) => (
                <OutgoingSender
                    key={item.client_uuid}
                    item={item}
                    canStart={
                        firstInChat.get(item.chat_id) === item.client_uuid
                    }
                    activeChatId={activeChat?.id ?? null}
                    onSent={(uuid) => {
                        outbox.remove(uuid);
                        // A send that works proves the session is back.
                        setSessionExpired(false);
                    }}
                    onFailed={outbox.markFailed}
                    onSessionExpired={() => setSessionExpired(true)}
                />
            ))}
        </>
    );
}
