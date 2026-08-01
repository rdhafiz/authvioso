import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Say what happened and give them somewhere to go. No apology, no cute
// illustration, and definitely no error codes or internal paths.
//
// If you're here because a URL we used to publish now 404s, that's a bug —
// retired pages should be redirecting, not landing here.
export default function NotFound() {
  return (
    <main id="main-content" className="container-prose flex-1 px-4 py-24">
      <h1>Page not found</h1>
      <p>This page does not exist. It may have moved.</p>
      <ul>
        <li>
          <Link href="/search">Search the curriculum</Link>
        </li>
        <li>
          <Link href="/learn">Start from the curriculum index</Link>
        </li>
        <li>
          <Link href="/">Go to the home page</Link>
        </li>
      </ul>
    </main>
  );
}
