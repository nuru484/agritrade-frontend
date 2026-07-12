"use client";

import { useEffect, useState } from "react";

/**
 * The debounced shadow of a fast-changing value (search boxes → server
 * queries). The first value is emitted immediately; changes settle after
 * `delayMs` of quiet.
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
