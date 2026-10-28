const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Midnight at the start of the day, in the browser's own time zone.
function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Whole calendar days from `date` to `now`, in the browser's time zone.
// Rounded because a day can be 23 or 25 hours long when clocks change.
function daysAgo(date: Date, now: Date): number {
    const difference = startOfDay(now).getTime() - startOfDay(date).getTime();

    return Math.round(difference / MS_PER_DAY);
}

// Equal for two times on the same local day. Used to group messages, never shown.
export function dayKey(iso: string): string {
    const date = new Date(iso);

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// "10:42"
export function formatClock(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Chat list: "10:42", "Yesterday", "Mon", then "12/10/26".
export function formatListTime(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    const days = daysAgo(date, now);

    // 0 is today. Below 0 is a clock slightly ahead of ours, so treat it as today.
    if (days <= 0) {
        return formatClock(iso);
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return date.toLocaleDateString(undefined, { weekday: "short" });
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

// Separator inside a chat: "Today", "Yesterday", "Monday", then "12 October 2026".
export function formatDayLabel(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    const days = daysAgo(date, now);

    if (days <= 0) {
        return "Today";
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
