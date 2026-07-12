"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { IUser } from "@/types/user.types";

/** The signed-in console user, or `null` when logged out. */
export function useCurrentUser(): IUser | null {
  return useSelector((state: RootState) => state.auth.user);
}
