import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle, UserCheck } from "lucide-react";

interface Site {
  id: string;
  title: string;
}

interface SiteUser {
  id: string;
  site_id: string;
  email: string;
  name: string;
}

interface RSVPSectionProps {
  site: Site;
  siteUser: SiteUser | null;
  navigate: (path: string) => void;
}

export const RSVPSection = ({ site, siteUser, navigate }: RSVPSectionProps) => {
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRSVP, setHasRSVP] = useState(false);
  const { toast } = useToast();

  const handleRSVP = async (willAttend: boolean) => {
    if (!siteUser) {
      // Se não estiver logado, redireciona para login com RSVP
      localStorage.setItem('currentSiteId', site.id);
      navigate(`/guest-login?siteId=${site.id}&rsvp=${willAttend ? 'yes' : 'no'}`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_rsvps')
        .upsert({
          site_id: site.id,
          site_user_id: siteUser.id,
          guest_name: siteUser.name,
          guest_email: siteUser.email,
          message: message.trim() || null,
          will_attend: willAttend
        });

      if (error) throw error;

      setHasRSVP(true);
      setRsvpStatus(willAttend ? 'yes' : 'no');
      setShowRSVPForm(false);

      toast({
        title: "RSVP enviado com sucesso!",
        description: willAttend 
          ? "Obrigado por confirmar sua presença!" 
          : "Obrigado por nos avisar!",
      });

      // Enviar email de confirmação
      try {
        await supabase.functions.invoke('send-rsvp-email', {
          body: {
            siteId: site.id,
            guestName: siteUser.name,
            guestEmail: siteUser.email,
            willAttend,
            message: message.trim() || null,
            siteTitle: site.title
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError);
        // Não mostrar erro para o usuário, pois o RSVP foi salvo com sucesso
      }

    } catch (error: any) {
      toast({
        title: "Erro ao enviar RSVP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPClick = (willAttend: boolean) => {
    if (siteUser) {
      setRsvpStatus(willAttend ? 'yes' : 'no');
      setShowRSVPForm(true);
    } else {
      handleRSVP(willAttend);
    }
  };

  if (hasRSVP) {
    return (
      <div className="container mx-auto px-4 mt-16">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              {rsvpStatus === 'yes' ? 'Presença Confirmada!' : 'Resposta Registrada'}
            </h3>
            <p className="text-green-700 text-sm">
              {rsvpStatus === 'yes' 
                ? 'Obrigado por confirmar sua presença. Esperamos você!'
                : 'Obrigado por nos avisar. Sentiremos sua falta!'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRSVPForm && siteUser) {
    return (
      <div className="container mx-auto px-4 mt-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Badge variant={rsvpStatus === 'yes' ? "default" : "secondary"} className="mb-4">
                  {rsvpStatus === 'yes' ? 'Confirmando Presença' : 'Informando Ausência'}
                </Badge>
                <h3 className="text-lg font-semibold mb-2">
                  Olá, {siteUser.name}!
                </h3>
                <p className="text-sm text-muted-foreground">
                  {rsvpStatus === 'yes' 
                    ? 'Que bom que você vai comparecer!'
                    : 'Obrigado por nos avisar que não poderá comparecer.'
                  }
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Deixe uma mensagem especial..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleRSVP(rsvpStatus === 'yes')}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirmar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRSVPForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-script mb-4" style={{ color: 'var(--title-color, var(--foreground))' }}>
          Confirmação de Presença
        </h3>
        {siteUser ? (
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-green-600" />
            <p className="text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{siteUser.name}</span>! Confirme sua participação:
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Sua presença é muito importante para nós! Por favor, confirme sua participação.
          </p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
        <Button 
          size="lg" 
          className="flex-1 w-full sm:w-auto"
          onClick={() => handleRSVPClick(true)}
        >
          <Heart className="h-5 w-5 mr-2" />
          Vou comparecer
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 w-full sm:w-auto"
          onClick={() => handleRSVPClick(false)}
        >
          Não poderei comparecer
        </Button>
      </div>
    </div>
  );
};