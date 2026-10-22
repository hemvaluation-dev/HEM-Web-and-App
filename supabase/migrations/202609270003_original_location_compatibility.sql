-- Safe compatibility patch for the original project.
-- This only adds a nullable alias and copies existing GPS address text.
-- No rows are deleted and no existing values are overwritten.
BEGIN;
ALTER TABLE public.case_location ADD COLUMN IF NOT EXISTS address text;
UPDATE public.case_location
SET address = address_from_gps
WHERE address IS NULL AND address_from_gps IS NOT NULL;
COMMIT;
