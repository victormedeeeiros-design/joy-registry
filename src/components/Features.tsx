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
  Camera,
  Building2,
  Crown,
  Link2,
  Zap,
  Target,
  Award
} from "lucide-react";
import dashboardImage from "@/assets/dashboard-preview.jpg";
import mobileImage from "@/assets/mobile-preview.jpg";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Site Criado na Hora",
      description: "Em poucos segundos seu site está pronto! Não precisa esperar dias ou contratar designer.",
      highlight: true
    },
    {
      icon: Settings,
      title: "Personalização Fácil",
      description: "Mude tudo com facilidade: cores, fotos, textos. Import/export de listas de presentes em planilhas."
    },
    {
      icon: Crown,
      title: "White Label Completo",
      description: "Assessores podem usar sua própria logo e domínio, criando uma experiência totalmente personalizada."
    },
    {
      icon: CreditCard,
      title: "Pague Apenas pelo Uso",
      description: "Modelo justo: você só paga quando realmente usar o site. Sem mensalidades ou taxas escondidas."
    },
    {
      icon: Link2,
      title: "Links Externos + PIX",
      description: "Além do pagamento integrado, adicione links externos para lojas e aceite PIX diretamente."
    },
    {
      icon: Smartphone,
      title: "100% Responsivo",
      description: "Sites que ficam perfeitos em celular, tablet e desktop. Seus convidados compram de qualquer lugar."
    }
  ];

  const userTypes = [
    {
      icon: Building2,
      title: "Assessores de Eventos",
      description: "Ofereça listas de presentes profissionais aos seus clientes com sua marca. White label completo, múltiplos sites e painel de controle avançado.",
      features: ["Logo e domínio próprios", "Múltiplos clientes", "Relatórios detalhados", "Suporte prioritário"],
      color: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: Heart,
      title: "Noivos & Pessoas Físicas",
      description: "Crie seu site de presentes dos sonhos. Escolha entre layouts únicos, conecte seu pagamento e receba sem taxas.",
      features: ["Layouts exclusivos", "Pagamento direto", "Zero comissão", "Fácil de usar"],
      color: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50"
    },
    {
      icon: Gift,
      title: "Convidados",
      description: "Experiência de compra simples e segura. Navegue pelos presentes, adicione ao carrinho e finalize tudo em um clique.",
      features: ["Interface intuitiva", "Carrinho inteligente", "Pagamento seguro", "Mobile otimizado"],
      color: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container space-y-24">
        {/* Competitive Advantages Section */}
        <div className="text-center space-y-8 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Por que Escolher a Amor&Presente?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-balance">
            O que nos torna
            <span className="gradient-primary bg-clip-text text-transparent"> únicos no mercado</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Criação Instantânea</h3>
              <p className="text-sm text-muted-foreground">Site pronto em segundos. Não precisa esperar dias ou semanas.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">White Label</h3>
              <p className="text-sm text-muted-foreground">Sua marca em destaque. Logo e domínio personalizados.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Fácil Personalização</h3>
              <p className="text-sm text-muted-foreground">Personalize tudo com facilidade. Import/export de listas.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Pague Apenas o Uso</h3>
              <p className="text-sm text-muted-foreground">Modelo justo: pague apenas quando usar o site.</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Gift className="w-4 h-4 mr-2" />
            Funcionalidades Completas
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
            <Card key={index} className={`gradient-card border-0 shadow-soft hover:shadow-elegant transition-elegant group ${feature.highlight ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-accent/5' : ''}`}>
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 ${feature.highlight ? 'bg-gradient-to-r from-primary to-accent' : 'gradient-primary'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-elegant`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  {feature.highlight && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10">
                      <Zap className="w-3 h-3 mr-1" />
                      DESTAQUE
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Types Section */}
        <div className="space-y-12">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="w-fit mx-auto px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Soluções para Cada Perfil
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">
              Amor&Presente para
              <span className="gradient-primary bg-clip-text text-transparent"> Todos os Momentos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seja você um profissional do mercado de eventos ou alguém planejando um momento especial, 
              temos a solução perfeita para suas necessidades.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <Card key={index} className={`border-0 shadow-soft hover:shadow-elegant transition-all duration-500 group text-left overflow-hidden bg-gradient-to-br ${type.bgGradient} hover:scale-105`}>
                <CardContent className="p-8 space-y-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-elegant shadow-lg`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{type.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{type.description}</p>
                  </div>
                  <div className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.color}`} />
                        <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <Badge variant="secondary" className="w-fit px-4 py-2">
              <Smartphone className="w-4 h-4 mr-2" />
              Experiência Premium
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">
              Sites que
              <span className="gradient-primary bg-clip-text text-transparent"> convertem visitas em presentes</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Design profissional que transmite confiança e facilita as compras. 
              Cada detalhe pensado para maximizar as conversões e criar uma experiência memorável.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Carrinho Inteligente</h4>
                    <p className="text-muted-foreground text-sm">Múltiplos presentes, uma única compra. Experiência de e-commerce profissional.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Links Diretos</h4>
                    <p className="text-muted-foreground text-sm">Cada presente com link próprio para compartilhamento individual.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Galeria Emocional</h4>
                    <p className="text-muted-foreground text-sm">Seção especial para contar a história do casal ou evento.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">RSVP Integrado</h4>
                    <p className="text-muted-foreground text-sm">Confirmação de presença integrada ao site de presentes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-lg">Destaque Especial</h4>
              </div>
              <p className="text-muted-foreground">
                <strong>Assessores:</strong> Ofereça aos seus clientes sites com sua marca, enquanto eles recebem 
                pagamentos diretos sem taxas. <strong>Win-win total!</strong>
              </p>
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