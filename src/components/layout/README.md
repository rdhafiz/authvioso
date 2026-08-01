# layout

Page skeletons. Nothing in here renders content of its own.

The one rule worth internalising: **the prose column doesn't grow.** It's
capped at 68ch and everything else — sidebar, aside, margins — gives up width
to keep it there. Wider text isn't a feature, it's just harder to read.

`WideBreakout` is how a diagram or a wide table escapes that cap. It exists so
components don't each roll their own negative-margin hack.
