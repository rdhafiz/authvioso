"use client";

import { useSyncExternalStore } from "react";

// Never fires. We only care about the server/client difference, and that
// never changes after the first render.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False on the server and during the first client render, true afterwards.
 *
 * For the handful of controls whose correct state can't be known until
 * they're in a browser — the theme buttons, anything reading localStorage.
 * Rendering the real state straight away would guarantee a hydration
 * mismatch.
 *
 * The useState+useEffect version of this does the same job, but it sets state
 * inside an effect, which trips the React Compiler lint rules and causes an
 * extra render pass. useSyncExternalStore is what that pattern turned into.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
