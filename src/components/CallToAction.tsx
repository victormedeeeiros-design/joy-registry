import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Crown, Zap, ArrowRight, CheckCircle } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Pronto para Começar?
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold text-balance">
            Transforme eventos em
            <span className="gradient-primary bg-clip-text text-transparent"> experiências inesquecíveis</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Junte-se aos profissionais que já descobriram como aumentar a satisfação dos clientes 
            e gerar nova fonte de receita com listas de presentes personalizadas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Assessores Card */}
          <Card className="border-0 shadow-elegant bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/10" />
            <CardContent className="p-8 relative space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Para Assessores</h3>
                  <p className="text-blue-600 font-medium">Solução White Label Completa</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Logo e domínio personalizados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Múltiplos clientes em um painel</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Clientes recebem 100% dos valores</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Suporte prioritário dedicado</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Começar Como Assessor
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Setup em 24h • Demo personalizada incluída
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pessoas Físicas Card */}
          <Card className="border-0 shadow-elegant bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/10" />
            <CardContent className="p-8 relative space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Para Você</h3>
                  <p className="text-pink-600 font-medium">Seu Evento dos Sonhos</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Layouts únicos e exclusivos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />  
                  <span className="text-sm font-medium">Zero taxas de comissão</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Pagamento direto na sua conta</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Fácil de criar e personalizar</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Criar Meu Site Agora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Grátis para sempre • Sem limite de presentes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">
            Ainda tem dúvidas? <span className="text-primary">Vamos conversar!</span>
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para mostrar como a Amor&Presente pode transformar seu negócio ou evento.
          </p>
          <Button variant="outline" size="lg" className="font-medium">
            Agendar Demonstração Gratuita
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;