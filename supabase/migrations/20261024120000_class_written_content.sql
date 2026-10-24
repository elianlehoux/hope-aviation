-- Written lesson content for classes (alongside or instead of video).
-- Shape: { "es": "<markdown>", "en": "<markdown>" }. Markdown supports the
-- campus lesson extensions (callouts, charts, steps, comparisons, knowledge
-- checks) rendered by components/features/campus/lesson/.
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS content jsonb;

COMMENT ON COLUMN public.classes.content IS
  'Translatable lesson body in Markdown with campus extensions: {"es": "...", "en": "..."}';

-- Cheap flag for outlines (avoids loading lesson bodies when listing a course).
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS has_content boolean
  GENERATED ALWAYS AS (
    content IS NOT NULL
    AND (COALESCE(btrim(content ->> 'es'), '') <> '' OR COALESCE(btrim(content ->> 'en'), '') <> '')
  ) STORED;
