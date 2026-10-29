import { router, usePage } from "@inertiajs/react";
import { ChatAvatar } from "@/components/chat/chat-avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { UserMenuContent } from "@/components/user-menu-content";
import { cn } from "@/lib/utils";
import { show as showChat } from "@/routes/chats";
import type { ChatSummary } from "@/types";
import { formatListTime } from "@/lib/time";

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

type Props = {
    chats: ChatSummary[];
    activeId: number | null;
};

export function ChatList({ chats, activeId }: Props) {
    return (
        <aside
            className={cn(
                "w-full flex-col border-r md:flex md:w-96 md:shrink-0",
                activeId === null ? "flex" : "hidden",
            )}
        >
            <ChatListHeader />

            {chats.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                    No conversations yet.
                </p>
            ) : (
                <ul className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <li key={chat.id} className="border-b">
                            <a
                                href={showChat.url(chat.id)}
                                onClick={(event) => {
                                    // Let the browser handle new-tab clicks (ctrl/cmd/shift/middle button).
                                    if (
                                        event.button !== 0 ||
                                        event.metaKey ||
                                        event.ctrlKey ||
                                        event.shiftKey ||
                                        event.altKey
                                    ) {
                                        return;
                                    }

                                    event.preventDefault();
                                    router.visit(showChat.url(chat.id), {
                                        only: ["activeChat", "messages"],
                                        reset: ["messages"],
                                        preserveState: true,
                                    });
                                }}
                                aria-current={
                                    chat.id === activeId ? "page" : undefined
                                }
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3",
                                    chat.id === activeId
                                        ? "bg-muted"
                                        : "hover:bg-muted/50",
                                )}
                            >
                                <ChatAvatar chat={chat} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate font-medium">
                                            {chat.title}
                                        </span>
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                            {formatListTime(
                                                chat.last_activity_at,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                                            {previewText(chat)}
                                        </p>
                                        {chat.has_left && (
                                            <span className="shrink-0 rounded bg-muted px-1.5 text-xs text-muted-foreground">
                                                Left
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}
