# providers

Context providers mounted in the root layout. Currently just the theme.

Keep these thin — every provider is a client component and lands in the
initial bundle. And none of them should gate content: if a chapter stops
rendering because JavaScript didn't load, that's an architecture problem, not
a loading state.
