import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function GuestLogin() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Armazena o siteId em um estado para maior confiabilidade
  const [siteId, setSiteId] = useState<string | null>(null);
  const [willAttend, setWillAttend] = useState<boolean | null>(null);

  useEffect(() => {
    const rsvpParam = searchParams.get('rsvp');
    const siteIdParam = searchParams.get('siteId');
    
    // Mostra um alerta para depuração no celular
    // Você pode remover esta linha depois de confirmar que funciona
    if (!siteIdParam) {
      alert("ALERTA: O ID do site não foi encontrado na URL. A confirmação de presença vai falhar.");
    }

    if (siteIdParam) {
      setSiteId(siteIdParam);
    }
    
    if (rsvpParam) {
      setWillAttend(rsvpParam === 'yes');
    }
  }, [searchParams]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, digite seu nome para confirmar a presença.');
      return;
    }

    // Validação crucial: Garante que o siteId existe antes de continuar
    if (!siteId) {
      toast.error('Erro: ID do site não encontrado. Não foi possível confirmar a presença.');
      console.error('Tentativa de RSVP sem siteId.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('site_rsvps')
        .insert({
          site_id: siteId, // Usa o siteId do estado, que é mais confiável
          guest_name: name,
          will_attend: willAttend,
          is_anonymous: true,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      // Envia o e-mail de notificação de forma assíncrona
      supabase.functions.invoke('send-rsvp-email', {
        body: { rsvpId: data.id },
      });

      toast.success('Presença confirmada com sucesso!');
      
      // Limpa o estado e redireciona de volta para o site público
      localStorage.removeItem('currentSiteId');
      navigate(`/s/${siteId}`);

    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error);
      if (error.message.includes('violates row-level security policy')) {
        toast.error('Falha de segurança ao confirmar presença. O site pode não estar ativo.');
      } else {
        toast.error('Ocorreu um erro ao confirmar sua presença. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (willAttend === null) return 'Confirmar Presença';
    return willAttend ? 'Confirmar Presença' : 'Recusar Convite';
  };

  const getDescription = () => {
    if (willAttend === null) return 'Digite seu nome para confirmar sua presença no evento.';
    return willAttend
      ? 'Estamos felizes por você vir! Digite seu nome para confirmar.'
      : 'Que pena que você não poderá comparecer. Deixe seu nome para sabermos.';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRSVP}>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}