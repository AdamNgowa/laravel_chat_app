import { Head } from "@inertiajs/react";
import { ChatList } from "@/components/chat/chat-list";
import type { ChatSummary } from "@/types";

export default function ChatsIndex({ chats }: { chats: ChatSummary[] }) {
    return (
        <>
            <Head title="Chats" />
            <ChatList chats={chats} />
            <section className="hidden flex-1 items-center justify-center md:flex">
                <p className="text-sm text-muted-foreground">
                    Select a chat to start messaging
                </p>
            </section>
        </>
    );
}
