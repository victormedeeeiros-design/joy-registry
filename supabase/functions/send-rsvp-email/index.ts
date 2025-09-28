import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RSVPEmailRequest {
  siteId: string;
  guestName: string;
  guestEmail: string;
  willAttend: boolean;
  message?: string;
  siteTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteId, guestName, guestEmail, willAttend, message, siteTitle }: RSVPEmailRequest = await req.json();

    console.log('Sending RSVP email:', { siteId, guestName, guestEmail, willAttend, siteTitle });

    const subject = willAttend 
      ? `Confirmação de Presença - ${siteTitle}`
      : `Resposta Recebida - ${siteTitle}`;

    const emailResponse = await resend.emails.send({
      from: "Lista de Presentes <noreply@resend.dev>",
      to: [guestEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4AF37; margin-bottom: 10px;">💝 ${siteTitle}</h1>
            <div style="width: 60px; height: 2px; background: #D4AF37; margin: 0 auto;"></div>
          </div>

          ${willAttend ? `
            <div style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #0369a1; margin: 0 0 10px 0;">✅ Presença Confirmada!</h2>
              <p style="color: #0369a1; margin: 0;">Que alegria saber que você estará conosco!</p>
            </div>
          ` : `
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0;">📝 Resposta Registrada</h2>
              <p style="color: #dc2626; margin: 0;">Obrigado por nos avisar. Sentiremos sua falta!</p>
            </div>
          `}

          <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">Detalhes da sua resposta:</h3>
            <p style="margin: 5px 0;"><strong>Nome:</strong> ${guestName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${guestEmail}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${willAttend ? 'Confirmado ✅' : 'Não comparecerá ❌'}</p>
            ${message ? `<p style="margin: 15px 0 5px 0;"><strong>Sua mensagem:</strong></p><p style="font-style: italic; color: #6b7280; padding: 10px; background: white; border-radius: 5px; margin: 5px 0;">"${message}"</p>` : ''}
          </div>

          ${willAttend ? `
            <div style="background: #ecfdf5; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #065f46; margin: 0 0 15px 0;">🎉 Estamos ansiosos para te ver!</h3>
              <p style="color: #065f46; margin: 0;">Sua presença tornará nosso momento ainda mais especial. Não esqueça de conferir nossa lista de presentes!</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Email enviado automaticamente pela Lista de Presentes<br>
              Não responda este email
            </p>
          </div>
        </div>
      `,
    });

    console.log("RSVP email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-rsvp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);