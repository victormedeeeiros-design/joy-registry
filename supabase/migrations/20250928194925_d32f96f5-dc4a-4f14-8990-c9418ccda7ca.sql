-- Insert sample products to the site
-- Fix the ambiguous column reference issue
DO $$
DECLARE
    site_record RECORD;
    product_ids TEXT[] := ARRAY['microwave', 'range-hood', 'grill', 'blender', 'mixer', 'electric-oven', 'air-fryer', 'stove'];
    current_product_id TEXT;
    position_counter INTEGER := 0;
BEGIN
    -- Get all active sites
    FOR site_record IN SELECT id FROM sites WHERE is_active = true LIMIT 1
    LOOP
        -- Add products to this site
        FOREACH current_product_id IN ARRAY product_ids
        LOOP
            -- Check if this product exists
            IF EXISTS (SELECT 1 FROM products WHERE id = current_product_id AND status = 'active') THEN
                -- Check if it's not already added to this site
                IF NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = site_record.id AND sp.product_id = current_product_id) THEN
                    INSERT INTO site_products (
                        site_id,
                        product_id,
                        position,
                        is_available
                    ) VALUES (
                        site_record.id,
                        current_product_id,
                        position_counter,
                        true
                    );
                    position_counter := position_counter + 1;
                END IF;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Added % products to site %', position_counter, site_record.id;
    END LOOP;
END $$;