import { router, useHttp } from "@inertiajs/react";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { send as sendMessage } from "@/routes/chats";
import type { SendMessageData, SendMessageResponse } from "@/types";

// Keep in step with StoreMessageRequest::MAX_BODY_LENGTH on the server.
const MAX_BODY_LENGTH = 5000;

// An empty draft with its own id. The id is made when the draft starts, not when
// Send is pressed, so pressing Send again after a failure repeats the SAME id
// and the server can recognise the retry.
function freshDraft(): SendMessageData {
    return { body: "", client_uuid: crypto.randomUUID() };
}

type Props = {
    chatId: number;
};

export function MessageComposer({ chatId }: Props) {
    const { data, setData, post, processing, errors } = useHttp<
        SendMessageData,
        SendMessageResponse
    >(freshDraft());
    const [failure, setFailure] = useState<string | null>(null);

    // Which chat is on screen right now. A reply can arrive after the user has
    // switched chats, and a callback only sees the values from when it was made.
    const currentChatId = useRef(chatId);

    // New chat: remember it, and start with an empty draft.
    useEffect(() => {
        currentChatId.current = chatId;
        setData(freshDraft());
        setFailure(null);
    }, [chatId]);

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (processing || data.body.trim() === "") {
            return;
        }

        const sentChatId = chatId;

        setFailure(null);

        post(sendMessage.url(sentChatId), {
            onSuccess: ({ message }) => {
                // The user moved to another chat while this was sending.
                // The message is saved; it will show when they come back.
                if (currentChatId.current !== sentChatId) {
                    return;
                }

                router.prependToProp("messages.data", message);
                setData(freshDraft());
                // The chat list's preview and order changed.
                router.reload({ only: ["chats"] });
            },
            onHttpException: (response) => {
                setFailure(
                    response.status === 403
                        ? "You can no longer send messages in this chat."
                        : "Couldn't send. Press Send to try again.",
                );
            },
            onNetworkError: () => {
                setFailure(
                    "Couldn't reach the server. Press Send to try again.",
                );
            },
        });
    }

    const problem = failure ?? errors.body;

    return (
        <form onSubmit={submit} className="border-t p-3">
            {problem && (
                <p className="mb-2 text-xs text-destructive">{problem}</p>
            )}
            <div className="flex items-end gap-2">
                <textarea
                    value={data.body}
                    onChange={(event) => setData("body", event.target.value)}
                    onKeyDown={(event) => {
                        if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                        ) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                    maxLength={MAX_BODY_LENGTH}
                    rows={1}
                    placeholder="Write a message"
                    aria-label="Message"
                    className="max-h-32 min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={processing || data.body.trim() === ""}
                    aria-label="Send message"
                >
                    <SendHorizontal className="size-4" />
                </Button>
            </div>
        </form>
    );
}
