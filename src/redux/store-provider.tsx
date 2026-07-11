"use client";

import { Provider } from "react-redux";
import { useState, type ReactNode } from "react";
import { makeStore } from "@/redux/store";

/** Mounts the Redux store at the root so any client island can use RTK Query.
 * The store is created once per mount via `useState`'s lazy initializer, so
 * each SSR request gets its own instance rather than sharing a module
 * singleton (and reading it in render is safe, unlike a ref). */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
