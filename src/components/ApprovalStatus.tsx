import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ApprovalStatus() {
  const { profile, isPending, isRejected } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleResendRequest = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-approval-request', {
        body: {
          userEmail: profile.email,
          userName: profile.full_name || 'Usuário'
        }
      });

      if (error) {
        console.error('Erro ao reenviar solicitação:', error);
        toast.error('Erro ao reenviar solicitação de aprovação');
      } else {
        toast.success('Solicitação de aprovação reenviada!');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isPending()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Aguardando Aprovação
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua conta foi criada com sucesso! Agora estamos aguardando a aprovação do administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>O que acontece agora?</strong>
              </p>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• O administrador foi notificado sobre sua solicitação</li>
                <li>• Você receberá um email quando sua conta for aprovada</li>
                <li>• Após a aprovação, você poderá criar seu site de casamento</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleResendRequest} 
              disabled={loading}
              variant="outline" 
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar Solicitação
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isRejected()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Solicitação Rejeitada
            </CardTitle>
            <CardDescription className="text-gray-600">
              Infelizmente, sua solicitação de acesso foi rejeitada pelo administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Próximos passos:</strong>
              </p>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                <li>• Entre em contato com o administrador para mais informações</li>
                <li>• Você pode tentar criar uma nova conta se necessário</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleResendRequest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Solicitar Nova Avaliação
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se chegou aqui, o usuário está aprovado
  return null;
}