// Shell for everything with the normal site chrome.
//
// The <main> lives here rather than in each page so the skip link in the root
// layout has something to land on no matter which route you're on. Header and
// footer slot in either side of it.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <SiteHeader /> */}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {/* <SiteFooter /> */}
    </>
  );
}
