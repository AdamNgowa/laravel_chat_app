import { Head } from "@inertiajs/react";
import { ChatList } from "@/components/chat/chat-list";
import type { ActiveChat, ChatSummary } from "@/types";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat/chat-panel";

type Props = {
    chats: ChatSummary[];
    activeChat: ActiveChat | null;
};

export default function ChatsIndex({ chats, activeChat }: Props) {
    return (
        <>
            <Head title={activeChat?.title ?? "Chats"} />
            <ChatList chats={chats} activeId={activeChat?.id ?? null} />
            <section
                className={cn(
                    "min-w-0 flex-1 flex-col",
                    activeChat === null ? "hidden md:flex" : "flex",
                )}
            >
                {activeChat === null ? (
                    <p className="p-6 text-sm text-muted-foreground">
                        Select a chat to start messaging
                    </p>
                ) : (
                    <ChatPanel chat={activeChat} />
                )}
            </section>
        </>
    );
}
