import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shown when there's nothing to show.
 *
 * Always give people somewhere to go from here. An empty state that just says
 * "nothing found" is a dead end, and dead ends are the thing we said we
 * wouldn't ship.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Links onward. Not optional in practice, even if the type says so. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle flex flex-col items-start gap-3 rounded-md border border-dashed px-6 py-10",
        className,
      )}
    >
      {Icon ? <Icon className="text-text-muted size-6" aria-hidden /> : null}
      <h2 className="text-md font-semibold">{title}</h2>
      {description ? (
        <p className="text-text-secondary max-w-prose">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
