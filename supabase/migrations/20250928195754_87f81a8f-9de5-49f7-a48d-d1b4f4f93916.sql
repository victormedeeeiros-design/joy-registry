-- Add event fields to sites for date, time, and location
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS event_time time without time zone,
  ADD COLUMN IF NOT EXISTS event_location text;
