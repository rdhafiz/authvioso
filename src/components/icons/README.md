# icons

Lucide, wrapped where we need consistency. 24px grid, 1.5px stroke at small
sizes.

- **No icon-only buttons.** An icon is a shortcut for people who already know
  what it means, which is exactly the wrong bet for a site aimed at people
  learning the subject.
- One meaning per icon, across the whole site and both languages. Reusing a
  glyph for a second thing is how icon sets stop being readable.
- Icons inherit `currentColor`, so they pick up contrast from their context
  for free.
- If an icon sits next to a visible label, hide it from screen readers. The
  label is the accessible name and announcing both is just noise.
- No flag icons for the language switcher.
