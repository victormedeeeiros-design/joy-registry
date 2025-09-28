import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Palette, 
  CreditCard, 
  Shield, 
  Smartphone, 
  Heart,
  Settings,
  Users,
  Gift,
  Camera
} from "lucide-react";
import dashboardImage from "@/assets/dashboard-preview.jpg";
import mobileImage from "@/assets/mobile-preview.jpg";

const Features = () => {
  const features = [
    {
      icon: Palette,
      title: "Personalização Completa",
      description: "Escolha layouts únicos para cada tipo de evento e personalize com suas fotos e cores favoritas."
    },
    {
      icon: CreditCard,
      title: "Pagamentos Diretos",
      description: "Integração com Stripe - receba os valores dos presentes diretamente na sua conta, sem taxas intermediárias."
    },
    {
      icon: Shield,
      title: "Seguro & Confiável",
      description: "Plataforma segura com autenticação robusta e proteção de dados de todos os usuários."
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Sites totalmente responsivos que ficam perfeitos em qualquer dispositivo."
    },
    {
      icon: Camera,
      title: "Upload de Fotos",
      description: "Adicione até 6 fotos especiais para contar a história do seu evento de forma única."
    },
    {
      icon: Settings,
      title: "Painel Completo",
      description: "Gerencie presentes, valores, descrições e acompanhe as vendas em tempo real."
    }
  ];

  const userTypes = [
    {
      icon: Users,
      title: "Administrador da Plataforma",
      description: "Crie e gerencie layouts, acompanhe vendas e tenha controle total sobre a plataforma.",
      color: "from-primary to-primary-glow"
    },
    {
      icon: Heart,
      title: "Criador do Site",
      description: "Personalize seu site de presentes, conecte seu Stripe e receba diretamente na sua conta.",
      color: "from-accent to-secondary"
    },
    {
      icon: Gift,
      title: "Presenteador",
      description: "Navegue pelos presentes, adicione ao carrinho e compre de forma simples e segura.",
      color: "from-success to-primary-glow"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container space-y-24">
        {/* Features Section */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Gift className="w-4 h-4 mr-2" />
            Funcionalidades
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-balance">
            Tudo que você precisa para
            <span className="gradient-primary bg-clip-text text-transparent"> criar presentes únicos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma plataforma completa com todas as ferramentas necessárias para criar, 
            personalizar e gerenciar sites de presentes profissionais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="gradient-card border-0 shadow-soft hover:shadow-elegant transition-elegant group">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-elegant">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Types Section */}
        <div className="space-y-12">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Users className="w-4 h-4 mr-2" />
              Para Quem é a Plataforma
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">
              Três perfis,
              <span className="gradient-primary bg-clip-text text-transparent"> uma experiência completa</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <Card key={index} className="gradient-card border-0 shadow-soft hover:shadow-elegant transition-elegant group text-center">
                <CardContent className="p-8 space-y-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-elegant`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{type.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <Badge variant="secondary" className="w-fit">
              <Smartphone className="w-4 h-4 mr-2" />
              Interface Intuitiva
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">
              Design elegante que
              <span className="gradient-primary bg-clip-text text-transparent"> emociona</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Cada site criado transmite a personalidade e emoção do seu evento especial. 
              Interface pensada para encantar presenteadores e facilitar suas compras.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Carrinho de Compras Inteligente</h4>
                  <p className="text-muted-foreground text-sm">Permite adicionar múltiplos presentes e finalizar uma única compra</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Links Diretos de Compra</h4>
                  <p className="text-muted-foreground text-sm">Cada presente pode ser compartilhado individualmente</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">História do Evento</h4>
                  <p className="text-muted-foreground text-sm">Seção especial para contar a história do casal ou evento</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative">
              <img 
                src={dashboardImage} 
                alt="Dashboard da plataforma de presentes mostrando interface de gerenciamento"
                className="w-full rounded-3xl shadow-elegant"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 rounded-3xl" />
            </div>
            
            <div className="absolute -bottom-8 -right-8 lg:-right-16">
              <img 
                src={mobileImage} 
                alt="Versão mobile do site de presentes em um smartphone elegante"
                className="w-48 lg:w-64 rounded-3xl shadow-elegant border-4 border-card"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;