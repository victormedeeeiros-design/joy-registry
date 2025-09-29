-- Add slug column to sites table
ALTER TABLE public.sites ADD COLUMN slug TEXT UNIQUE;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_site_slug(title_text TEXT, site_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to slug format: lowercase, remove accents, replace spaces with hyphens, remove special chars
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(title_text, '[áàâãäå]', 'a', 'g'),
                '[éèêë]', 'e', 'g'
              ),
              '[íìîï]', 'i', 'g'
            ),
            '[óòôõö]', 'o', 'g'
          ),
          '[úùûü]', 'u', 'g'
        ),
        '[ç]', 'c', 'g'
      ),
      '[^a-z0-9\s]', '', 'g'
    )
  );
  
  -- Replace spaces with hyphens and remove multiple consecutive hyphens
  base_slug := regexp_replace(
    regexp_replace(base_slug, '\s+', '-', 'g'),
    '-+', '-', 'g'
  );
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length to 50 characters
  base_slug := substring(base_slug from 1 for 50);
  base_slug := trim(both '-' from base_slug);
  
  -- Start with the base slug
  final_slug := base_slug;
  
  -- Check if slug already exists (excluding current site if updating)
  WHILE EXISTS (
    SELECT 1 FROM public.sites 
    WHERE slug = final_slug 
    AND (site_id IS NULL OR id != site_id)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger to auto-generate slug when inserting/updating
CREATE OR REPLACE FUNCTION public.update_site_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate slug if not provided or if title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title) THEN
    NEW.slug := public.generate_site_slug(NEW.title, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER sites_slug_trigger
  BEFORE INSERT OR UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_slug();

-- Generate slugs for existing sites
UPDATE public.sites 
SET slug = public.generate_site_slug(title, id)
WHERE slug IS NULL;