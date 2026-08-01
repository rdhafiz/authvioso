# ui

Generic bits with no knowledge of the curriculum — buttons, badges, callouts,
tables, empty states.

shadcn components land here as **source**, not as a dependency. Once a
component is in this folder it's ours: edit it freely, it won't be overwritten.

A few things that trip people up:

- Name components for what they are, not what they look like. `SecurityCallout`
  survives a redesign; `RedBox` doesn't.
- Variants are for state, not for behaviour. If a variant changes what the
  component _does_, it's a second component.
- Everything interactive needs all six states — default, hover, focus, active,
  disabled, loading. Disabled is the one people skip, and it's also the one
  that usually fails contrast.
- Don't strip the focus ring. Ever.
- Colours and spacing come from tokens. If you're typing a hex value, stop.
