import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle, UserCheck, Phone, Users, Baby } from "lucide-react";

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
  const [phone, setPhone] = useState("");
  const [adultsCount, setAdultsCount] = useState("1");
  const [childrenCount, setChildrenCount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [hasRSVP, setHasRSVP] = useState(false);
  const { toast } = useToast();

  const handleRSVP = async (willAttend: boolean) => {
    console.log('RSVP handleRSVP called with:', { willAttend, siteUser, site });
    
    if (!siteUser) {
      // Se não estiver logado, redireciona para login com RSVP
      console.log('RSVP - User not logged, redirecting to login');
      localStorage.setItem('currentSiteId', site.id);
      navigate(`/guest-login?siteId=${site.id}&rsvp=${willAttend ? 'yes' : 'no'}`);
      return;
    }

    setLoading(true);
    try {
      console.log('RSVP Debug - Site ID:', site.id, 'User:', siteUser);
      
      // Primeiro verifica se já existe um RSVP para este usuário neste site
      const { data: existingRSVP, error: selectError } = await supabase
        .from('site_rsvps')
        .select('*')
        .eq('site_id', site.id)
        .eq('guest_email', siteUser.email)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao buscar RSVP existente:', selectError);
      }

      let error = null;

      if (existingRSVP) {
        console.log('RSVP Debug - Atualizando RSVP existente:', existingRSVP.id);
        // Se já existe, faz update
        const { error: updateError } = await supabase
          .from('site_rsvps')
          .update({
            site_user_id: siteUser.id,
            guest_name: siteUser.name,
            message: message.trim() || null,
            phone: phone.trim() || null,
            adults_count: willAttend ? parseInt(adultsCount) : null,
            children_count: willAttend ? parseInt(childrenCount) : null,
            will_attend: willAttend,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRSVP.id);
        error = updateError;
      } else {
        console.log('RSVP Debug - Criando novo RSVP');
        // Se não existe, faz insert
        const rsvpData = {
          site_id: site.id,
          site_user_id: siteUser.id,
          guest_name: siteUser.name,
          guest_email: siteUser.email,
          message: message.trim() || null,
          phone: phone.trim() || null,
          adults_count: willAttend ? parseInt(adultsCount) : null,
          children_count: willAttend ? parseInt(childrenCount) : null,
          will_attend: willAttend
        };
        
        console.log('RSVP Debug - Dados do RSVP:', rsvpData);
        
        const { error: insertError, data: insertData } = await supabase
          .from('site_rsvps')
          .insert(rsvpData);
        
        console.log('RSVP Debug - Resultado insert:', { error: insertError, data: insertData });
        error = insertError;
      }

      if (error) {
        console.error('RSVP Debug - Erro na operação:', error);
        throw error;
      }

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
      console.error('RSVP Error Details:', error);
      
      let errorMessage = error.message || 'Erro desconhecido';
      
      // Tratar erros específicos de RLS
      if (error.message && error.message.includes('row-level security policy')) {
        errorMessage = 'Erro de permissão. Tente fazer login novamente.';
      } else if (error.message && error.message.includes('duplicate key')) {
        errorMessage = 'Você já confirmou presença para este evento.';
      }
      
      toast({
        title: "Erro ao enviar RSVP",
        description: errorMessage,
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
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone para contato
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                {rsvpStatus === 'yes' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Adultos
                        </Label>
                        <Select value={adultsCount} onValueChange={setAdultsCount}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'pessoa' : 'pessoas'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="children" className="flex items-center gap-2">
                          <Baby className="h-4 w-4" />
                          Crianças
                        </Label>
                        <Select value={childrenCount} onValueChange={setChildrenCount}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'criança' : 'crianças'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

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
        <h3 className="text-3xl font-sloop mb-4" style={{ color: 'var(--title-color, var(--foreground))' }}>
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