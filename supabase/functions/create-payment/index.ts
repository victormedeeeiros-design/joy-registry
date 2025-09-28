import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Parse request body
    const { items, siteId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items are required");
    }

    if (!siteId) {
      throw new Error("Site ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerId;
    let customerEmail;

    // Always proceed with guest checkout (no authentication required)
    // Users can provide their email during Stripe checkout

    // Prepare line items for Stripe
    const lineItems = [];

    for (const item of items) {
      let name;
      let price;
      let description;
      let imageUrl;
      let stripePrice;

      if (item.id && siteId) {
        const { data: siteProduct, error: siteProductError } = await supabaseClient
          .from('site_products')
          .select('*, products(*)')
          .eq('id', item.id)
          .eq('site_id', siteId)
          .single();

        if (!siteProductError && siteProduct && siteProduct.products) {
          const product = siteProduct.products;
          name = siteProduct.custom_name || product.name;
          price = siteProduct.custom_price ?? product.price;
          description = siteProduct.custom_description || product.description || undefined;
          imageUrl = siteProduct.custom_image_url || product.image_url || undefined;

          if (product.stripe_price_id) {
            stripePrice = product.stripe_price_id;
          } else {
            const validImage = typeof imageUrl === 'string' && /^https?:\/\//.test(imageUrl);
            const stripeProduct = await stripe.products.create({
              name,
              description,
              images: validImage ? [imageUrl] : undefined,
              metadata: {
                product_id: product.id,
                site_product_id: siteProduct.id
              }
            });
            const stripePriceObj = await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: Math.round((price as number) * 100),
              currency: 'brl',
            });
            stripePrice = stripePriceObj.id;
            await supabaseClient
              .from('products')
              .update({
                stripe_product_id: stripeProduct.id,
                stripe_price_id: stripePriceObj.id
              })
              .eq('id', product.id);
          }
        }
      }

      // If we still don't have a stripePrice, use item-provided data as fallback
      if (!stripePrice) {
        name = item.name || name;
        price = item.price ?? price;
        description = item.description || description;
        imageUrl = item.image_url || imageUrl;
        if (!name || typeof price !== 'number') {
          throw new Error('Missing product data for checkout item');
        }
        const validImage2 = typeof imageUrl === 'string' && /^https?:\/\//.test(imageUrl);
        const stripeProduct = await stripe.products.create({
          name,
          description,
          images: validImage2 ? [imageUrl] : undefined,
          metadata: {
            site_id: siteId,
            source: 'fallback'
          }
        });
        const stripePriceObj = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(price * 100),
          currency: 'brl',
        });
        stripePrice = stripePriceObj.id;
      }

      lineItems.push({
        price: stripePrice,
        quantity: item.quantity || 1,
      });
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/site/${siteId}`,
      metadata: {
        site_id: siteId,
        items: JSON.stringify(items)
      },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});