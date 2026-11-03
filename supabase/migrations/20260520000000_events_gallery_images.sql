-- Optional event photo gallery (public asset paths)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.events.gallery_images IS 'Optional event photo gallery paths (public URLs)';
