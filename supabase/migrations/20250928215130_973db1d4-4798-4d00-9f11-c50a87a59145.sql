-- Add font_color column to sites table
ALTER TABLE public.sites ADD COLUMN font_color text DEFAULT 'default';