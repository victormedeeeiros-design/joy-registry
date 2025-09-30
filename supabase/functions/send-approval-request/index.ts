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

    const { userEmail, userName, userId } = await req.json();

    console.log('Enviando email de aprovação para:', {
      userEmail,
      userName,
      userId,
      adminEmail: 'victormedeeeiros@gmail.com'
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lista de Presentes <onboarding@resend.dev>",
        to: ["victormedeeeiros@gmail.com"],
        subject: `🔔 Nova Solicitação de Cadastro - ${userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">
                🔔 Nova Solicitação de Cadastro
              </h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Nome:</strong> ${userName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${userEmail}</p>
                <p style="margin: 0 0 10px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p style="margin: 0;"><strong>ID do Usuário:</strong> ${userId}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; margin-bottom: 20px;">
                  Este usuário precisa da sua aprovação para criar sites na plataforma.
                </p>
                
                <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8081'}/admin/users" 
                   style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; font-weight: bold;">
                  🔗 Acessar Painel Admin
                </a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>💡 Dica:</strong> Acesse o link acima para aprovar ou rejeitar este usuário diretamente no painel administrativo.
                </p>
              </div>
            </div>
          </div>
        `
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Erro do Resend:', emailResult);
      throw new Error(`Falha ao enviar email: ${emailResult.message || 'Erro desconhecido'}`);
    }

    console.log('Email enviado com sucesso:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de aprovação enviado com sucesso',
        emailId: emailResult.id
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na função send-approval-request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao enviar email de aprovação'
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});