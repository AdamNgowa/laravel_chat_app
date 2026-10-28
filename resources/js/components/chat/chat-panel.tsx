import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { Fragment, useLayoutEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { dayKey, formatDayLabel } from "@/lib/time";
import { index as chatsIndex } from "@/routes/chats";
import type { ActiveChat } from "@/types";

function DaySeparator({ label }: { label: string }) {
    return (
        <div className="my-3 flex justify-center">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

export function ChatPanel({ chat }: { chat: ActiveChat }) {
    const scroller = useRef<HTMLDivElement>(null);

    // Open every chat at its newest message. Runs once the messages are in the
    // page but before the browser paints, so the top of the list never flashes by.
    useLayoutEffect(() => {
        const element = scroller.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [chat.id]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex items-center gap-3 border-b px-4 py-3">
                <Link
                    href={chatsIndex()}
                    only={["activeChat"]}
                    preserveState
                    className="md:hidden"
                    aria-label="Back to chats"
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <h2 className="truncate font-medium">{chat.title}</h2>
            </header>

            <div
                ref={scroller}
                className="flex-1 space-y-1 overflow-y-auto p-4"
            >
                {chat.messages.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                        No messages yet
                    </p>
                ) : (
                    chat.messages.map((message, index) => {
                        const previous = chat.messages[index - 1];
                        const startsNewDay =
                            previous === undefined ||
                            dayKey(previous.created_at) !==
                                dayKey(message.created_at);

                        return (
                            <Fragment key={message.id}>
                                {startsNewDay && (
                                    <DaySeparator
                                        label={formatDayLabel(
                                            message.created_at,
                                        )}
                                    />
                                )}
                                <MessageBubble
                                    message={message}
                                    showSender={
                                        chat.type === "group" &&
                                        !message.is_mine
                                    }
                                />
                            </Fragment>
                        );
                    })
                )}
            </div>

            {!chat.can_send && (
                <p className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
                    You left this group, so you can no longer send messages.
                </p>
            )}
        </div>
    );
}
