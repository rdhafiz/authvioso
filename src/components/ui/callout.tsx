import {
  AlertTriangle,
  Ban,
  Info,
  Lightbulb,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Callouts.
 *
 * Each variant means one thing and only that thing. Don't reach for `danger`
 * because a note needs emphasis — once a style has two meanings readers stop
 * trusting any of them.
 *
 * Every variant carries an icon, a colour and a word. The word is the part
 * that matters: colour alone doesn't survive greyscale printing, colour
 * blindness, or a forced-colours mode.
 *
 * `insecure` is the odd one out. It marks code or a pattern we're showing
 * specifically so we can criticise it, and it has to be impossible to skim
 * past and mistake for a recommendation — someone will copy it anyway, so the
 * label does the work the reader's attention won't.
 */

type CalloutVariant =
  | "note"
  | "tip"
  | "warning"
  | "danger"
  | "security"
  | "deprecated"
  | "insecure";

const variants: Record<
  CalloutVariant,
  { label: string; icon: typeof Info; className: string; iconClass: string }
> = {
  note: {
    label: "Note",
    icon: Info,
    className: "border-status-info bg-status-info-surface",
    iconClass: "text-status-info",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    className: "border-status-success bg-status-success-surface",
    iconClass: "text-status-success",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "border-status-warning bg-status-warning-surface",
    iconClass: "text-status-warning",
  },
  danger: {
    label: "Danger",
    icon: TriangleAlert,
    className: "border-status-danger bg-status-danger-surface",
    iconClass: "text-status-danger",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    className: "border-status-warning bg-status-warning-surface",
    iconClass: "text-status-warning",
  },
  deprecated: {
    label: "Deprecated",
    icon: Ban,
    className: "border-status-warning bg-status-warning-surface",
    iconClass: "text-status-warning",
  },
  insecure: {
    label: "Do not do this",
    icon: Ban,
    // Heavier border than the others, on purpose.
    className: "border-2 border-status-danger bg-status-danger-surface",
    iconClass: "text-status-danger",
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  /** Overrides the default label. The label itself is never removed. */
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({
  variant = "note",
  title,
  children,
  className,
}: CalloutProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        "my-8 rounded-md border-l-4 px-4 py-3",
        config.className,
        className,
      )}
    >
      <p className="mb-2 flex items-center gap-2 font-semibold">
        <Icon className={cn("size-4 shrink-0", config.iconClass)} aria-hidden />
        <span>{title ?? config.label}</span>
      </p>
      <div className="[&>*:last-child]:mb-0 [&>p]:mb-2">{children}</div>
    </aside>
  );
}
