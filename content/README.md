# content

Chapters and the knowledge graph. Empty until the curriculum is written.

```
content/
  en/chapters/     MDX, one file per chapter
  en/pages/
  bn/              same structure, same filenames
  graph/           nodes, relationships, topics
```

## Why this isn't in src/

These files are the actual product. Keeping them as plain MDX means they diff
properly in review, they survive us swapping framework, and anyone who forks
the repo gets the material rather than an export. A CMS would put the most
valuable thing here behind a service and break the review process at the same
time.

## Conventions

Both languages use the same filenames and the same chapter IDs — `C16` is the
same chapter in English and Bangla, so examples, quiz questions and links all
resolve to one thing regardless of which edition someone is reading.

Don't translate terms that a spec fixes. `OAuth`, `JWT` and `WebAuthn` stay as
they are; the prose around them gets translated. Same for slugs, tags and IDs —
if those diverge, the two editions stop linking to each other.

English is the source. Where a translation and the English disagree, English
wins until someone works out which one is actually wrong.

## Graph

`graph/*.json` is data, not code, and it's validated at build. A cycle, an
orphaned node or a dangling reference fails the build rather than shipping.
See `src/lib/graph/README.md`.
