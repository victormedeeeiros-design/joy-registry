import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const siteIdParam = searchParams.get('siteId') || localStorage.getItem('currentSiteId');
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    if (siteIdParam) {
      setSiteId(siteIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen gradient-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="gradient-card border-0 shadow-elegant text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pagamento Realizado com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">
                Obrigado pela sua compra! Seu pagamento foi processado com sucesso.
              </p>
              {sessionId && (
                <p className="text-sm text-muted-foreground">
                  ID da sessão: {sessionId}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="text-sm">
                Você receberá um email de confirmação em breve com os detalhes da sua compra.
              </p>
              
              <Button 
                onClick={() => navigate(siteId ? `/site/${siteId}` : '/')} 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;