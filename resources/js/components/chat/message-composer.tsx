import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";

// Keep in step with StoreMessageRequest::MAX_BODY_LENGTH on the server.
const MAX_BODY_LENGTH = 5000;

type Props = {
    onSend: (body: string) => void;
};

// The box at the bottom of a chat. It only collects text; sending is done by the outbox.
export function MessageComposer({ onSend }: Props) {
    const [body, setBody] = useState("");

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        const text = body.trim();

        if (text === "") {
            return;
        }

        onSend(text);
        setBody("");
    }

    return (
        <form onSubmit={submit} className="border-t p-3">
            <div className="flex items-end gap-2">
                <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
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
                    disabled={body.trim() === ""}
                    aria-label="Send message"
                >
                    <SendHorizontal className="size-4" />
                </Button>
            </div>
        </form>
    );
}
