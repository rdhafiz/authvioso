"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Three options, not a toggle.
 *
 * A two-state toggle traps anyone who once tapped "light" — there's no way
 * back to following the OS. Cheap to support, annoying to live without.
 */
const options = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  // The server has no idea which theme is active, so painting the selected
  // state before hydration guarantees a mismatch. Nothing reads as selected
  // until we're on the client.
  const hydrated = useHydrated();

  return (
    <fieldset className="border-border-subtle inline-flex rounded-md border p-0.5">
      <legend className="sr-only">Colour theme</legend>
      {options.map(({ value, label, icon: Icon }) => {
        const selected = hydrated && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={selected}
            title={label}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
              selected
                ? "bg-surface-sunken text-text-primary"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
