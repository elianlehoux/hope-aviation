-- Written lesson content for classes (alongside or instead of video).
-- Shape: { "es": "<markdown>", "en": "<markdown>" }. Markdown supports the
-- campus lesson extensions (callouts, charts, steps, comparisons, knowledge
-- checks) rendered by components/features/campus/lesson/.
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS content jsonb;

COMMENT ON COLUMN public.classes.content IS
  'Translatable lesson body in Markdown with campus extensions: {"es": "...", "en": "..."}';
