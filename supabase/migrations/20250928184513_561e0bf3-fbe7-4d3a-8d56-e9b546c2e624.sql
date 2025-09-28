-- Add color_scheme and font_family columns to sites table
ALTER TABLE public.sites 
ADD COLUMN color_scheme text DEFAULT 'elegant-gold',
ADD COLUMN font_family text DEFAULT 'inter';