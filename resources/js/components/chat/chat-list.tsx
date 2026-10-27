import { usePage } from "@inertiajs/react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { UserMenuContent } from "@/components/user-menu-content";
import type { ChatSummary } from "@/types";

// The one line of text under a title.
function previewText(chat: ChatSummary): string {
    const { preview } = chat;

    if (preview === null) {
        return "No messages yet";
    }

    if (preview.is_system) {
        return preview.body;
    }

    if (preview.is_mine) {
        return `You: ${preview.body}`;
    }

    return chat.type === "group"
        ? `${preview.sender_name}: ${preview.body}`
        : preview.body;
}

function ChatListHeader() {
    const { auth } = usePage().props;

    if (!auth.user) {
        return null;
    }

    return (
        <header className="flex items-center justify-between border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Chats</h1>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-auto p-1.5"
                        data-test="chat-user-menu"
                    >
                        <UserInfo user={auth.user} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="min-w-56 rounded-lg"
                >
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

export function ChatList({ chats }: { chats: ChatSummary[] }) {
    return (
        <aside className="flex w-full flex-col border-r md:w-96 md:shrink-0">
            <ChatListHeader />

            {chats.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                    No conversations yet.
                </p>
            ) : (
                <ul className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <li
                            key={chat.id}
                            className="flex items-center gap-3 border-b px-4 py-3"
                        >
                            <ChatAvatar chat={chat} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="truncate font-medium">
                                        {chat.title}
                                    </span>
                                    {chat.has_left && (
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                            Left
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-sm text-muted-foreground">
                                    {previewText(chat)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}
