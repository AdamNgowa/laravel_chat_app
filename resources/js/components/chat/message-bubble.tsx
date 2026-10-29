import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/time";
import type { ChatMessage } from "@/types";

type Props = {
    message: ChatMessage;
    showSender: boolean;
};

export function MessageBubble({ message, showSender }: Props) {
    if (message.type === "system") {
        return (
            <p className="my-2 text-center text-xs text-muted-foreground">
                {message.body}
            </p>
        );
    }

    return (
        <div
            className={cn(
                "flex py-0.5",
                message.is_mine ? "justify-end" : "justify-start",
            )}
        >
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    message.is_mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                )}
            >
                {showSender && (
                    <p className="mb-0.5 text-xs font-medium opacity-70">
                        {message.sender_name}
                    </p>
                )}
                <p className="break-words whitespace-pre-wrap">
                    {message.body}
                </p>
                <p className="mt-1 text-right text-[10px] opacity-60">
                    {formatClock(message.created_at)}
                </p>
            </div>
        </div>
    );
}
