import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not found in environment variables');
    }

    const { userEmail, userName, approved } = await req.json();

    const subject = approved 
      ? `✅ Seu cadastro foi aprovado!` 
      : `❌ Cadastro não aprovado`;
      
    const message = approved
      ? 'Parabéns! Seu cadastro foi aprovado. Agora você pode criar seus sites de lista de presentes.'
      : 'Infelizmente seu cadastro não foi aprovado desta vez. Entre em contato conosco se tiver dúvidas.';

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lista de Presentes <onboarding@resend.dev>",
        to: [userEmail],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: ${approved ? '#22c55e' : '#ef4444'}; text-align: center; margin-bottom: 30px;">
                ${approved ? '✅' : '❌'} ${subject}
              </h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá ${userName},
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                ${message}
              </p>
              
              ${approved ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8081'}/dashboard" 
                     style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    🚀 Acessar Plataforma
                  </a>
                </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Atenciosamente,<br>
                  Equipe Lista de Presentes
                </p>
              </div>
            </div>
          </div>
        `
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Falha ao enviar email de notificação');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de notificação enviado com sucesso' 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na função send-approval-notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao enviar email de notificação'
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});