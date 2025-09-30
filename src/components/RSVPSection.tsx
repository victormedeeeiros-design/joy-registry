import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Site } from '@/integrations/supabase/types';

interface RSVPSectionProps {
  site: Site;
  onRsvpSuccess: () => void;
}

export function RSVPSection({ site, onRsvpSuccess }: RSVPSectionProps) {
  const { user: siteUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRSVP = async (willAttend: boolean) => {
    setLoading(true);

    // Se o usuário não estiver logado, redireciona para a página de convidado
    if (!siteUser) {
      navigate(`/guest-login?siteId=${site.id}&rsvp=${willAttend ? 'yes' : 'no'}`);
      return; // A execução para aqui para não logados
    }

    // Lógica para usuários logados
    try {
      const { data, error } = await supabase
        .from('site_rsvps')
        .insert({
          site_id: site.id,
          user_id: siteUser.id,
          guest_name: siteUser.user_metadata.name || 'Usuário Logado',
          will_attend: willAttend,
          is_anonymous: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Envia o e-mail de notificação
      supabase.functions.invoke('send-rsvp-email', {
        body: { rsvpId: data.id },
      });

      toast.success('Presença confirmada com sucesso!');
      onRsvpSuccess(); // Atualiza a lista de presenças na página
    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error);
      if (error.message.includes('violates row-level security policy')) {
        toast.error('Falha ao confirmar presença. Verifique se o site está ativo.');
      } else if (error.code === '23505') { // Código de violação de chave única
        toast.info('Você já confirmou sua presença neste evento.');
      } else {
        toast.error('Ocorreu um erro ao confirmar sua presença.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-semibold mb-4">Confirmar Presença</h2>
      <p className="mb-6">Por favor, confirme se você poderá comparecer ao evento.</p>
      <div className="flex justify-center gap-4">
        <Button 
          size="lg" 
          onClick={() => handleRSVP(true)} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Aguarde...' : 'Sim, eu vou!'}
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          onClick={() => handleRSVP(false)} 
          disabled={loading}
        >
          {loading ? 'Aguarde...' : 'Não poderei ir'}
        </Button>
      </div>
    </div>
  );
}