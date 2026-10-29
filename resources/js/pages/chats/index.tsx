import { Head } from "@inertiajs/react";
import { ChatList } from "@/components/chat/chat-list";
import { ChatPanel } from "@/components/chat/chat-panel";
import { cn } from "@/lib/utils";
import type { ActiveChat, ChatSummary, MessagePage } from "@/types";

type Props = {
    chats: ChatSummary[];
    activeChat: ActiveChat | null;
    messages: MessagePage | null;
};

export default function ChatsIndex({ chats, activeChat, messages }: Props) {
    console.log(messages); // temporary: shows what the server sends. Remove after the spike.

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
                {activeChat === null || messages === null ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Select a chat to start messaging
                        </p>
                    </div>
                ) : (
                    <ChatPanel chat={activeChat} messages={messages.data} />
                )}
            </section>
        </>
    );
}
