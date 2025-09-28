import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Shield, 
  CreditCard, 
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const SupabaseNotice = () => {
  const features = [
    {
      icon: Users,
      title: "Autenticação Completa",
      description: "Login com email/senha e integração com Google para todos os tipos de usuários"
    },
    {
      icon: Database,
      title: "Banco de Dados Robusto",
      description: "Armazenamento seguro de layouts, produtos, usuários e configurações"
    },
    {
      icon: Shield,
      title: "Controle de Acesso",
      description: "RLS policies para garantir que cada usuário acesse apenas seus dados"
    },
    {
      icon: CreditCard,
      title: "Integração Stripe",
      description: "Gerenciamento seguro de chaves API e processamento de pagamentos"
    }
  ];

  return (
    <section className="py-24 gradient-accent relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-card border-0 shadow-elegant">
            <CardContent className="p-12 text-center space-y-8">
              <Badge variant="secondary" className="w-fit mx-auto">
                <Database className="w-4 h-4 mr-2" />
                Backend Necessário
              </Badge>
              
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-balance">
                  Para funcionar completamente, esta plataforma precisa do
                  <span className="gradient-primary bg-clip-text text-transparent"> Supabase</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Nossa integração nativa com Supabase oferece todos os recursos de backend 
                  necessários para criar uma plataforma de presentes completa e segura.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-success/10 border border-success/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <span className="font-semibold text-success">Funcionalidades Habilitadas com Supabase</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>• Cadastro de usuários</div>
                  <div>• Upload de fotos</div>
                  <div>• Criação de layouts</div>
                  <div>• Gerenciamento de produtos</div>
                  <div>• Integração com Stripe</div>
                  <div>• Controle de vendas</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="success" className="font-semibold">
                  <Database className="w-5 h-5 mr-2" />
                  Conectar ao Supabase
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="font-medium">
                  Ver Documentação da Integração
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SupabaseNotice;