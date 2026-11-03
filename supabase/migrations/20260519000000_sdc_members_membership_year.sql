-- SDC membership cohort year (e.g. 2026 batch)
ALTER TABLE public.sdc_members
  ADD COLUMN IF NOT EXISTS membership_year integer;

UPDATE public.sdc_members
SET membership_year = 2026
WHERE membership_year IS NULL;

ALTER TABLE public.sdc_members
  ALTER COLUMN membership_year SET NOT NULL,
  ALTER COLUMN membership_year SET DEFAULT (extract(year from now())::integer);

COMMENT ON COLUMN public.sdc_members.membership_year IS 'SDC membership cohort year (e.g. 2026 batch)';
