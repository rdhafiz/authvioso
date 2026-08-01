# learning

The chapter components. This is the part of the codebase that justifies the
rest of it.

Chapter header, prerequisites, definitions, security callouts, best practices,
common mistakes, the inline check-yourself questions, related concepts, the
mark-as-read control.

Some of these have rules that aren't obvious from the name:

- **Prerequisites show direct dependencies only.** Expanding the full chain
  gives you twenty entries and readers skip all of them.
- **`InsecureExample` has to be impossible to mistake for a recommendation.**
  Distinct styling, an explicit label, and never wired up as something you can
  copy and run. Someone will copy it anyway; make that as hard as possible.
- **Security callouts say what the defence doesn't cover.** A mitigation
  presented as complete is worse than not mentioning it.
- **Mark-as-read is a button, not a scroll listener.** Inferring it rewards
  leaving a tab open.
- **Check-yourself questions aren't scored or stored.** They exist so someone
  finds out they didn't follow the chapter while re-reading is still cheap.
