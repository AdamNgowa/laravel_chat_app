import { Head } from "@inertiajs/react";
import { index as chatsIndex } from "@/routes/chats";

type Props = {
    status: number;
};

function copyFor(status: number): { title: string; text: string } {
    switch (status) {
        // A missing page and a forbidden one read the same on purpose, so this
        // page never reveals which chats exist.
        case 403:
        case 404:
            return {
                title: "This page isn't available",
                text: "It may not exist, or you may not have access to it.",
            };
        case 503:
            return {
                title: "We'll be right back",
                text: "The site is down for maintenance. Try again in a few minutes.",
            };
        default:
            return {
                title: "Something went wrong",
                text: "That was on our side. Try again in a moment.",
            };
    }
}

// Shown for 403, 404, 500 and 503 when the app is not in debug mode.
export default function ErrorPage({ status }: Props) {
    const copy = copyFor(status);

    return (
        <>
            <Head title={copy.title} />
            <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">{status}</p>
                <h1 className="text-2xl font-semibold">{copy.title}</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                    {copy.text}
                </p>
                {/* A plain link: after an error, a full page load starts from a clean slate. */}
                <a
                    href={chatsIndex.url()}
                    className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                    Back to chats
                </a>
            </div>
        </>
    );
}
