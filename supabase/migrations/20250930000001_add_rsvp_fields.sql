-- Add new fields to site_rsvps table for enhanced RSVP functionality
ALTER TABLE public.site_rsvps 
ADD COLUMN phone TEXT,
ADD COLUMN adults_count INTEGER,
ADD COLUMN children_count INTEGER;