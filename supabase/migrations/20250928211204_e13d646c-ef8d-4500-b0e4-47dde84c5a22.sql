-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to select products
CREATE POLICY "Authenticated users can select products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to update products 
CREATE POLICY "Authenticated users can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (true);