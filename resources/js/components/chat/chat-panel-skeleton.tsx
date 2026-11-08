import { cn } from "@/lib/utils";

// Grey stand-ins for messages: who sent it, and how wide.
const BUBBLES = [
    { mine: false, width: "w-2/5" },
    { mine: false, width: "w-1/2" },
    { mine: true, width: "w-1/3" },
    { mine: false, width: "w-3/5" },
    { mine: true, width: "w-2/5" },
    { mine: true, width: "w-1/4" },
];

// Shown in place of the chat panel while the next chat is on its way.
export function ChatPanelSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading chat"
            className="flex min-h-0 flex-1 animate-pulse flex-col"
        >
            <div className="border-b px-4 py-4">
                <div className="h-4 w-40 rounded bg-muted" />
            </div>

            <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden p-4">
                {BUBBLES.map((bubble, index) => (
                    <div
                        key={index}
                        className={cn("flex", bubble.mine && "justify-end")}
                    >
                        <div
                            className={cn(
                                "h-9 rounded-2xl bg-muted",
                                bubble.width,
                            )}
                        />
                    </div>
                ))}
            </div>

            <div className="border-t p-3">
                <div className="h-10 rounded-md bg-muted" />
            </div>
        </div>
    );
}
