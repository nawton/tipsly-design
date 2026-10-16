"use client";

import { useEffect, useState } from "react";
import { stockholmNow } from "@/lib/time";

/**
 * Current Stockholm wall-clock time, re-rendering on every `intervalMs`
 * boundary. Server and browser both compute it during render, so text that
 * changes faster than the interval (the seconds of a countdown) needs
 * `suppressHydrationWarning` on its element.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => stockholmNow());
  useEffect(() => {
    let interval = 0;
    const tick = () => setNow(stockholmNow());
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, intervalMs);
    }, intervalMs - (Date.now() % intervalMs));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [intervalMs]);
  return now;
}
