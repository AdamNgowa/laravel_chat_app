import { useEffect, useState } from "react";

/**
 * True only once `flag` has been true for `delayMs`. Something that finishes
 * quickly never shows, so a fast connection never flashes a loading state.
 */
export function useDelayedFlag(flag: boolean, delayMs: number): boolean {
    const [delayed, setDelayed] = useState(false);

    useEffect(() => {
        if (!flag) {
            setDelayed(false);

            return;
        }

        const timer = setTimeout(() => setDelayed(true), delayMs);

        return () => clearTimeout(timer);
    }, [flag, delayMs]);

    return delayed;
}
