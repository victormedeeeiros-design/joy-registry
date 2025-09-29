-- Add foreign key constraints after products table is created
ALTER TABLE public.site_products
  ADD CONSTRAINT site_products_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id);