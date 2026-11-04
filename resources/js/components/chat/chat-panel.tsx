import { InfiniteScroll, Link } from "@inertiajs/react";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { OutgoingBubble } from "@/components/chat/outgoing-bubble";
import { Button } from "@/components/ui/button";
import { dayKey, formatDayLabel } from "@/lib/time";
import { index as chatsIndex } from "@/routes/chats";
import type { ActiveChat, ChatMessage, OutgoingMessage } from "@/types";

// How close to the newest message still counts as "at the bottom".
const NEAR_BOTTOM_PX = 100;

function isNearBottom(element: HTMLElement): boolean {
    return (
        element.scrollHeight - element.scrollTop - element.clientHeight <
        NEAR_BOTTOM_PX
    );
}

function DaySeparator({ label }: { label: string }) {
    return (
        <div className="my-3 flex justify-center">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

// What the scroller looked like after the last render, to detect a prepend.
type Snapshot = {
    chatId: number;
    oldestId: number;
    height: number;
    top: number;
};

type Props = {
    chat: ActiveChat;
    // Newest first, exactly as the server pages them.
    messages: readonly ChatMessage[];
    // This chat's messages that the server has not confirmed yet.
    outgoing: readonly OutgoingMessage[];
    onSend: (body: string) => void;
    onRetry: (uuid: string) => void;
    onDiscard: (uuid: string) => void;
};

export function ChatPanel({
    chat,
    messages,
    outgoing,
    onSend,
    onRetry,
    onDiscard,
}: Props) {
    const scroller = useRef<HTMLDivElement>(null);
    const [nearBottom, setNearBottom] = useState(true);
    const snapshot = useRef<Snapshot | null>(null);

    // Shown oldest first. Copy before reversing: reverse() changes the array it is called on.
    const ordered = [...messages].reverse();

    // A pending message disappears the moment its saved copy is in the list.
    const visiblePending = outgoing.filter(
        (item) =>
            !messages.some(
                (message) => message.client_uuid === item.client_uuid,
            ),
    );
    const pendingCount = visiblePending.length;

    // Open every chat at its newest message, before the browser paints.
    useLayoutEffect(() => {
        const element = scroller.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
            // A short chat fires no scroll event, so measure again here.
            setNearBottom(isNearBottom(element));
        }
    }, [chat.id]);

    // You just sent a message: show it. (Other people's messages arrive in Phase 4,
    // with their own rule: only follow them if you are already at the bottom.)
    const newest = messages[0];
    const newestId = newest?.id;
    const newestIsMine = newest?.is_mine ?? false;

    useLayoutEffect(() => {
        const element = scroller.current;

        if (element && (newestIsMine || pendingCount > 0)) {
            element.scrollTop = element.scrollHeight;
        }
    }, [newestId, newestIsMine, pendingCount]);

    // Older messages were added above the view: keep the reader where they were.
    useLayoutEffect(() => {
        const element = scroller.current;

        if (!element) {
            return;
        }

        const oldestId = ordered[0]?.id ?? null;
        const before = snapshot.current;

        if (
            before !== null &&
            before.chatId === chat.id &&
            before.oldestId !== null &&
            oldestId !== null &&
            oldestId < before.oldestId
        ) {
            const expectedTop =
                before.top + (element.scrollHeight - before.height);

            if (element.scrollTop < expectedTop - 1) {
                element.scrollTop = expectedTop;
            }
        }

        snapshot.current = {
            chatId: chat.id,
            oldestId,
            height: element.scrollHeight,
            top: element.scrollTop,
        };
    });

    function scrollToNewest() {
        scroller.current?.scrollTo({
            top: scroller.current.scrollHeight,
            behavior: "smooth",
        });
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex items-center gap-3 border-b px-4 py-3">
                <Link
                    href={chatsIndex()}
                    only={["activeChat", "messages"]}
                    preserveState
                    className="md:hidden"
                    aria-label="Back to chats"
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <h2 className="truncate font-medium">{chat.title}</h2>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col">
                <div
                    ref={scroller}
                    onScroll={(event) => {
                        const element = event.currentTarget;

                        setNearBottom(isNearBottom(element));

                        if (snapshot.current) {
                            snapshot.current.top = element.scrollTop;
                        }
                    }}
                    className="flex-1 overflow-y-auto p-4"
                >
                    {ordered.length === 0 && pendingCount === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            No messages yet
                        </p>
                    )}

                    {ordered.length > 0 && (
                        <InfiniteScroll
                            data="messages"
                            reverse
                            preserveUrl
                            autoScroll={false}
                            loading={() => (
                                <p className="py-2 text-center text-xs text-muted-foreground">
                                    Loading older messages…
                                </p>
                            )}
                        >
                            {ordered.map((message, index) => {
                                const previous = ordered[index - 1];
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
                            })}
                        </InfiniteScroll>
                    )}

                    {visiblePending.map((item) => (
                        <OutgoingBubble
                            key={item.client_uuid}
                            item={item}
                            onRetry={onRetry}
                            onDiscard={onDiscard}
                        />
                    ))}
                </div>

                {!nearBottom && (
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={scrollToNewest}
                        aria-label="Scroll to newest message"
                        className="absolute right-4 bottom-4 rounded-full shadow-md"
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                )}
            </div>

            {chat.can_send ? (
                // The key gives every chat a fresh, empty box.
                <MessageComposer key={chat.id} onSend={onSend} />
            ) : (
                <p className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
                    You left this group, so you can no longer send messages.
                </p>
            )}
        </div>
    );
}
