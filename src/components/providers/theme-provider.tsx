"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps next-themes with our defaults so the settings live in one place.
 *
 * A few of these matter more than they look:
 *
 * `defaultTheme="system"` + `enableSystem` means we follow the OS and never
 * guess. No time-of-day switching.
 *
 * The switcher needs three options, not two — System, Light, Dark. If you
 * only offer Light/Dark then someone who once tapped Light can never get back
 * to following their system.
 *
 * `disableTransitionOnChange` stops colours animating during the swap. It
 * looks nice in a demo and feels broken when you're actually using it.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="authvioso-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
