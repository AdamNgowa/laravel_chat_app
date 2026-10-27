import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import type { ChatSummary } from "@/types";

export function ChatAvatar({ chat }: { chat: ChatSummary }) {
    const getInitials = useInitials();

    // A chat with yourself is titled "Your Name (You)"; the label is not part of the name.
    const name = chat.title.replace(/ \(You\)$/, "");

    return (
        <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-neutral-200 text-sm text-black dark:bg-neutral-700 dark:text-white">
                {chat.type === "group" ? (
                    <Users className="size-5" />
                ) : (
                    getInitials(name)
                )}
            </AvatarFallback>
        </Avatar>
    );
}
