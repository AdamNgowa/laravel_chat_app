import { cn } from "@/lib/utils";
import type { OutgoingMessage } from "@/types";

type Props = {
    item: OutgoingMessage;
    onRetry: (uuid: string) => void;
    onDiscard: (uuid: string) => void;
};

// A message you wrote that the server has not confirmed: dimmed while sending, red when it failed.
export function OutgoingBubble({ item, onRetry, onDiscard }: Props) {
    const failed = item.status === "failed";

    return (
        <div className="flex flex-col items-end py-0.5">
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    failed
                        ? "bg-destructive/10 ring-1 ring-destructive"
                        : "bg-primary/60 text-primary-foreground",
                )}
            >
                <p className="break-words whitespace-pre-wrap">{item.body}</p>
            </div>

            {failed ? (
                <div className="mt-1 flex items-center gap-2 text-xs text-destructive">
                    <span>{item.error ?? "Couldn't send."}</span>
                    <button
                        type="button"
                        onClick={() => onRetry(item.client_uuid)}
                        className="underline"
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        onClick={() => onDiscard(item.client_uuid)}
                        className="underline"
                    >
                        Delete
                    </button>
                </div>
            ) : (
                <span className="mt-1 text-[10px] text-muted-foreground">
                    Sending…
                </span>
            )}
        </div>
    );
}
