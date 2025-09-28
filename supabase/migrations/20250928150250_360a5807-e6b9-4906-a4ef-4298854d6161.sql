-- Fix wrong foreign key on sites.layout_id referencing products
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_layout_id_fkey;
ALTER TABLE public.sites
  ADD CONSTRAINT sites_layout_id_fkey
  FOREIGN KEY (layout_id) REFERENCES public.layouts(id);

-- Create public storage bucket for site images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for bucket
-- Public can view images in 'site-images'
CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Authenticated users can upload/update/delete in their own folder (prefix = auth.uid())
CREATE POLICY "Users can upload their images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images' AND auth.uid()::text = (storage.foldername(name))[1]
);