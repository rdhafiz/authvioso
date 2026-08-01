# search

Types only so far. No index, no query engine.

## Shape

Index is built at publish time from the content and the knowledge graph, ships
as a static JSON artefact, and is queried in the browser. Nothing goes to a
server, so no query ever leaves the reader's machine.

Weighting, highest first:

| Source             | Why                                                 |
| ------------------ | --------------------------------------------------- |
| Concept statements | One sentence per concept — the densest text we have |
| Chapter titles     |                                                     |
| Glossary terms     |                                                     |
| Aliases            | See below                                           |
| Body text          | Broadest, noisiest                                  |
| Diagram alt text   | Already written for accessibility, useful here too  |

## Aliases are the whole trick

Someone searching "stay logged in" or "remember me" needs to reach sessions.
They are never going to type "session identifier" — that's the term they came
here to learn.

Aliases come from three places: alternate names in the glossary, deprecated
terminology readers still encounter in older material, and queries that
returned nothing. That last one is the most valuable and the only reason we
record failed searches at all.

## Failed queries

Counts per query string, in aggregate. No identifier, no session, nothing tied
to a person. It's the one thing we measure about reader behaviour and the
justification is narrow: a recurring miss means either a missing alias, a
missing concept, or a chapter that doesn't answer what it looks like it
answers. All three are content bugs.

## Not doing

No hosted search. No personalised or behavioural ranking — results come from
what matches, not from what other people clicked. No tracking of what any
individual searched for.

## Open

Which client-side engine. The index will be a few hundred documents at most,
so almost anything works; the deciding factor is bundle size and whether it
supports field weighting without a lot of glue.
