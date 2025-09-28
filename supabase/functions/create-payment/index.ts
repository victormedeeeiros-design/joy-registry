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

    // Try to get authenticated user (optional for guest checkout)
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        const user = data.user;
        
        if (user?.email) {
          customerEmail = user.email;
          
          // Check if a Stripe customer record exists for this user
          const customers = await stripe.customers.list({ email: user.email, limit: 1 });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          }
        }
      }
    } catch (authError) {
      // User not authenticated - proceed with guest checkout
      console.log("Proceeding with guest checkout");
    }

    // Prepare line items for Stripe
    const lineItems = [];
    
    for (const item of items) {
      // Get site product details
      const { data: siteProduct, error: siteProductError } = await supabaseClient
        .from('site_products')
        .select('*, products(*)')
        .eq('id', item.id)
        .eq('site_id', siteId)
        .single();

      if (siteProductError || !siteProduct) {
        throw new Error(`Product not found: ${item.id}`);
      }

      const product = siteProduct.products;
      if (!product) {
        throw new Error(`Product data not found for: ${item.id}`);
      }

      // Use custom values from site_product or fallback to product defaults
      const name = siteProduct.custom_name || product.name;
      const price = siteProduct.custom_price || product.price;
      const description = siteProduct.custom_description || product.description;
      const imageUrl = siteProduct.custom_image_url || product.image_url;

      // Create or get Stripe price for this product
      let stripePrice;
      
      if (product.stripe_price_id) {
        // Use existing Stripe price
        stripePrice = product.stripe_price_id;
      } else {
        // Create new Stripe product and price
        const stripeProduct = await stripe.products.create({
          name: name,
          description: description || undefined,
          images: imageUrl ? [imageUrl] : undefined,
          metadata: {
            product_id: product.id,
            site_product_id: siteProduct.id
          }
        });

        const stripePriceObj = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(price * 100), // Convert to cents
          currency: 'brl',
        });

        stripePrice = stripePriceObj.id;

        // Update product with Stripe IDs
        await supabaseClient
          .from('products')
          .update({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePriceObj.id
          })
          .eq('id', product.id);
      }

      lineItems.push({
        price: stripePrice,
        quantity: item.quantity || 1,
      });
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});