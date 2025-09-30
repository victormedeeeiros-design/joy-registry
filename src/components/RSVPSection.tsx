import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteAuth } from '@/hooks/useSiteAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
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

  console.log('RSVPSection rendered with:', { site: site?.id, siteUser: siteUser?.email });

  const handleRSVP = async (willAttend: boolean) => {
    console.log('RSVP handleRSVP called with:', { willAttend, siteUser: siteUser?.email, site: site?.id });
    
    if (!siteUser) {
      // Se não estiver logado, redireciona para login com RSVP
      console.log('RSVP - User not logged, redirecting to login');
      localStorage.setItem('currentSiteId', site.id);
      const url = `/guest-login?siteId=${site.id}&rsvp=${willAttend ? 'yes' : 'no'}`;
      console.log('RSVP - Redirecting to:', url);
      navigate(url);
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

      toast.success(willAttend 
        ? "Obrigado por confirmar sua presença!" 
        : "Obrigado por nos avisar!"
      );

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
      
      toast.error('Erro ao enviar RSVP: ' + errorMessage);
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
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              {rsvpStatus === 'yes' ? 'Presença Confirmada!' : 'Resposta Registrada'}
            </h3>
            <p className="text-green-700">
              {rsvpStatus === 'yes' 
                ? 'Obrigado por confirmar sua presença. Aguardamos você!' 
                : 'Obrigado por nos informar. Sentiremos sua falta!'
              }
            </p>
            <Badge className="mt-4 bg-green-100 text-green-800">
              <UserCheck className="h-4 w-4 mr-1" />
              Confirmado
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRSVPForm) {
    return (
      <div className="container mx-auto px-4 mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                {rsvpStatus === 'yes' ? 'Confirmar Presença' : 'Informar Ausência'}
              </h3>
              <p className="text-muted-foreground">
                {rsvpStatus === 'yes' 
                  ? 'Ficamos felizes em saber que você estará conosco!' 
                  : 'Obrigado por nos informar.'
                }
              </p>
            </div>

            <div className="space-y-4">
              {/* Informações de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone (opcional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Contagem de pessoas - só aparece se confirmar presença */}
              {rsvpStatus === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Adultos que comparecerão
                    </Label>
                    <Select value={adultsCount} onValueChange={setAdultsCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'adulto' : 'adultos'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="children" className="flex items-center gap-2">
                      <Baby className="h-4 w-4" />
                      Crianças que comparecerão
                    </Label>
                    <Select value={childrenCount} onValueChange={setChildrenCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'criança' : 'crianças'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Mensagem */}
              <div>
                <Label htmlFor="message">Mensagem para os noivos (opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="Deixe uma mensagem carinhosa para os noivos..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleRSVP(rsvpStatus === 'yes')}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Confirmar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRSVPForm(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--title-color, var(--foreground))' }}>
              Confirme sua Presença
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Sua presença é muito importante para nós! Por favor, nos informe se poderá comparecer ao nosso grande dia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => handleRSVPClick(true)}
                disabled={loading}
              >
                <Heart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Vou comparecer</span>
                <span className="sm:hidden">Compareço</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                onClick={() => handleRSVPClick(false)}
                disabled={loading}
              >
                <span className="hidden sm:inline">Não poderei comparecer</span>
                <span className="sm:hidden">Não vou</span>
              </Button>
            </div>

            {!siteUser && (
              <p className="text-sm text-muted-foreground mt-6 p-4 bg-muted/30 rounded-lg">
                <UserCheck className="h-4 w-4 inline mr-2" />
                Você será redirecionado para fazer um cadastro rápido antes de confirmar sua presença.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};