"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** Reads the text at click time rather than holding a copy of it. */
  getText: () => string;
  className?: string;
}

export function CopyButton({ getText, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can reject on http origins or if permission is denied.
      // The code is still selectable, so failing quietly is fine here —
      // an error toast for something the user can do manually is noise.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      // The label changes rather than only the icon, so screen reader users
      // get the confirmation too.
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "text-text-secondary hover:text-text-primary hover:bg-surface-sunken inline-flex size-8 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="size-icon-xs" aria-hidden />
      ) : (
        <Copy className="size-icon-xs" aria-hidden />
      )}
    </button>
  );
}
