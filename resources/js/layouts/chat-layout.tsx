import { PropsWithChildren } from "react";

export default function ChatLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
            {children}
        </div>
    );
}
