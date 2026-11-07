import { login } from "@/routes";

type Props = {
    onDismiss: () => void;
};

// Shown across the top when a request found this tab signed out. The login link
// opens a NEW tab, so nothing on this page (the unsent messages) is lost.
export function SessionExpiredBanner({ onDismiss }: Props) {
    return (
        <div
            role="alert"
            className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-destructive px-4 py-2 text-sm text-white"
        >
            <span>Your session has expired.</span>
            <a
                href={login.url()}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
            >
                Log in again
            </a>
            <span>then come back here and press Retry.</span>
            <button type="button" onClick={onDismiss} className="underline">
                Dismiss
            </button>
        </div>
    );
}
