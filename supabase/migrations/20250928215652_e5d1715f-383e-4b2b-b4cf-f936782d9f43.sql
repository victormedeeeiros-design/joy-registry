-- Update sites table to have separate font colors for menu and hero
ALTER TABLE public.sites DROP COLUMN font_color;
ALTER TABLE public.sites ADD COLUMN font_color_menu text DEFAULT 'default';
ALTER TABLE public.sites ADD COLUMN font_color_hero text DEFAULT 'white';