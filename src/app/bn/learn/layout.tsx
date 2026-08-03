import { CurriculumSidebar } from "@/components/navigation/curriculum-sidebar";

/**
 * Layout for everything under /learn.
 *
 * Three regions on a wide screen, and the important bit is that the middle
 * one doesn't grow: prose stays at its cap and the sidebar takes the leftover
 * width. The aside (table of contents) is rendered by the chapter page rather
 * than here, because only chapters have one.
 *
 * Below `lg` the sidebar drops out of the flow entirely. It's reachable from
 * the part pages and the chapter index, so nothing is stranded — a permanent
 * drawer toggle on mobile costs more than it gives here.
 */
export default function LearnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="container-page flex gap-12 px-4 py-10">
      <aside className="hidden w-[280px] shrink-0 lg:block">
        {/* Sticky so the reader keeps their place while scrolling a long
            chapter. Scrolls independently once it outgrows the viewport. */}
        <div className="sticky top-10 max-h-[calc(100dvh-5rem)] overflow-y-auto pr-2">
          <CurriculumSidebar />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
