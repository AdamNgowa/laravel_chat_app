/** What went wrong with a request, in words a person can act on. */
export type RequestFailure = {
    text: string;
    // True when this tab is no longer signed in (401, or 419 from an out-of-date token).
    sessionExpired: boolean;
};

export function describeFailure(status: number): RequestFailure {
    switch (status) {
        // Two statuses, one meaning. A case with no `return` falls through to the next one.
        case 401:
        case 419:
            return {
                text: "Your session has expired. Log in again, then try again.",
                sessionExpired: true,
            };
        case 403:
            return {
                text: "You can no longer do that in this chat.",
                sessionExpired: false,
            };
        case 404:
            return {
                text: "That chat or person is no longer available.",
                sessionExpired: false,
            };
        case 429:
            return {
                text: "Too many requests. Wait a moment, then try again.",
                sessionExpired: false,
            };
        default:
            return {
                text:
                    status >= 500
                        ? "Something went wrong on our side. Try again."
                        : "Couldn't complete that. Try again.",
                sessionExpired: false,
            };
    }
}
