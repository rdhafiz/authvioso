"use client";

// Don't render `error.message` or `error.digest` here. The message can carry
// internal detail and the digest is only meaningful in our logs — showing it
// gives the reader something that looks actionable and isn't.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="container-prose flex-1 px-4 py-24">
      <h1>Something went wrong on our side</h1>
      <p>Nothing you did caused this.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
