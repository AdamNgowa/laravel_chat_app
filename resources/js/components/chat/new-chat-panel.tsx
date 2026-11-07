import { router, useHttp } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { describeFailure } from "@/lib/request-failure";
import { store as startChat } from "@/routes/chats";
import { search as searchUsers } from "@/routes/users";
import type { SearchUser, SearchUsersResponse } from "@/types";

// Keep in step with UserSearchController (min:2, max:50).
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 50;
const SEARCH_DELAY_MS = 300;
const SEARCH_FAILED = "Couldn't search. Keep typing to try again.";

type Props = {
    onClose: () => void;
    onSessionExpired: () => void;
};

// Replaces the chat list while you look for someone to message.
export function NewChatPanel({ onClose, onSessionExpired }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchUser[] | null>(null);
    const [searchProblem, setSearchProblem] = useState<string | null>(null);
    const [startingId, setStartingId] = useState<number | null>(null);
    const [startFailed, setStartFailed] = useState(false);

    // No data of its own: the search word travels in the URL (see the effect).
    const { get, cancel, processing } = useHttp<
        Record<string, never>,
        SearchUsersResponse
    >({});

    const term = query.trim();
    const debouncedTerm = useDebouncedValue(term, SEARCH_DELAY_MS);

    // The word has settled: search for it.
    useEffect(() => {
        // Anything still in flight was for an older word.
        cancel();
        setSearchProblem(null);

        if (debouncedTerm.length < MIN_QUERY_LENGTH) {
            setResults(null);

            return;
        }

        const params = new URLSearchParams({ q: debouncedTerm }).toString();

        get(`${searchUsers.url()}?${params}`, {
            onSuccess: (response) => setResults(response.users),
            onError: () => setSearchProblem(SEARCH_FAILED),
            onHttpException: (response) => {
                const failure = describeFailure(response.status);

                if (failure.sessionExpired) {
                    onSessionExpired();
                }

                setSearchProblem(failure.text);
            },
            onNetworkError: () => setSearchProblem(SEARCH_FAILED),
        }).catch(() => {
            // Every failure is handled by the callbacks above.
        });
    }, [debouncedTerm]);

    function start(user: SearchUser) {
        if (startingId !== null) {
            return;
        }

        setStartingId(user.id);
        setStartFailed(false);

        router.post(
            startChat.url(),
            { user_id: user.id },
            {
                // Keep the page's state (the outbox of unsent messages) across this visit.
                preserveState: true,
                onSuccess: () => onClose(),
                onError: () => setStartFailed(true),
                onFinish: () => setStartingId(null),
            },
        );
    }

    // What to say instead of a list, if anything.
    let message: string | null = null;

    if (term.length < MIN_QUERY_LENGTH) {
        message = `Type at least ${MIN_QUERY_LENGTH} letters of a name.`;
    } else if (searchProblem !== null) {
        message = searchProblem;
    } else if (results === null) {
        message = "Searching…";
    } else if (results.length === 0) {
        message = processing ? "Searching…" : "No one found.";
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b px-3 py-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Back to chats"
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    maxLength={MAX_QUERY_LENGTH}
                    placeholder="Search by name"
                    aria-label="Search people"
                    className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
            </div>

            {startFailed && (
                <p className="px-4 py-2 text-xs text-destructive">
                    Couldn't start that chat. Try again.
                </p>
            )}

            <div className="flex-1 overflow-y-auto">
                {message !== null ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                        {message}
                    </p>
                ) : (
                    <ul>
                        {(results ?? []).map((user) => (
                            <li key={user.id} className="border-b">
                                <button
                                    type="button"
                                    onClick={() => start(user)}
                                    disabled={startingId !== null}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 disabled:opacity-60"
                                >
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
                                    {startingId === user.id && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            Opening…
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
