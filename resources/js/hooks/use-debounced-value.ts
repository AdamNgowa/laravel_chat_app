import { useEffect, useState } from "react";

/**
 * A copy of `value` that only updates once it has stopped changing for `delayMs`.
 * Typing "emma" quickly gives one new value, not four.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        // Every change starts a timer; the cleanup cancels the previous one.
        const timer = setTimeout(() => setDebounced(value), delayMs);

        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
