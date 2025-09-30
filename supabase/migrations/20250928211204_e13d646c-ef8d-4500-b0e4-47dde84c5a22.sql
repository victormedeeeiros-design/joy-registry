-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (status = 'active');

-- Allow authenticated users to update products 
CREATE POLICY "Authenticated users can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (true);