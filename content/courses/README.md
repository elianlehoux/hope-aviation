# Campus courses as files

Each folder here is one course: a `course.json` (modules, class titles, exams) and one Markdown file per class.

## Writing a class

Classes are Markdown plus a few campus blocks (see `lib/campus/lesson-blocks.ts`):

- `> [!NOTE] Title`, `> [!TIP]`, `> [!WARNING]`, `> [!VERSE] Juan 3:16` callouts
- ` ```steps ` numbered steps, one `Title: Description` per line
- ` ```stats ` big numbers, one `value | label` per line
- ` ```check ` ungraded knowledge check (`?` question, `+` correct, `-` wrong, `>` explanation)
- ` ```chart ` bar or line chart

## Importing into Supabase

```bash
pnpm content:build content/courses/fundamentos-de-la-mision
```

This writes `supabase/content/<slug>.sql`. Run it locally with psql, or paste it into the Supabase SQL Editor for production.

- The course is created as a **draft**; publish it from the campus editor.
- Re-running the import updates the same rows (ids come from the slug and each item's position). It never changes the publish status.
- Reordering classes or questions in the files changes which row each position maps to, so prefer editing in the campus once students are enrolled.
- Video URLs are not part of the files yet; add them in the campus editor.
