import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MobileRSVPRequest {
  site_id: string;
  guest_name: string;
  guest_email: string;
  will_attend: boolean;
  user_agent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { site_id, guest_name, guest_email, will_attend, user_agent }: MobileRSVPRequest = await req.json();

    console.log('Mobile RSVP Fallback:', { site_id, guest_name, guest_email, will_attend, user_agent });

    // Verify site exists and is active
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, title, is_active')
      .eq('id', site_id)
      .eq('is_active', true)
      .single();

    if (siteError || !site) {
      throw new Error('Site não encontrado ou inativo');
    }

    // Insert RSVP using service role (bypasses RLS)
    const rsvpData = {
      site_id,
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim(),
      will_attend,
      message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try upsert first (in case user already has RSVP)
    const { data, error } = await supabase
      .from('site_rsvps')
      .upsert(rsvpData, {
        onConflict: 'site_id,guest_email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Mobile RSVP Error:', error);
      throw error;
    }

    console.log('Mobile RSVP Success:', data);

    // Try to send email notification (don't fail if email fails)
    try {
      await supabase.functions.invoke('send-rsvp-email', {
        body: {
          siteId: site_id,
          guestName: guest_name.trim(),
          guestEmail: guest_email.trim(),
          willAttend: will_attend,
          message: null,
          siteTitle: site.title || 'Lista de Presentes'
        },
      });
    } catch (emailError) {
      console.error('Email notification failed (non-critical):', emailError);
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      message: will_attend ? 'Presença confirmada!' : 'Resposta registrada!'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Mobile RSVP Fallback Error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);