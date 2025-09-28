-- Add fields for customizable section titles and title colors
ALTER TABLE public.sites ADD COLUMN section_title_1 text DEFAULT 'O Início de Tudo';
ALTER TABLE public.sites ADD COLUMN section_title_2 text DEFAULT 'Nossa Nova Casa';
ALTER TABLE public.sites ADD COLUMN title_color text DEFAULT 'default';