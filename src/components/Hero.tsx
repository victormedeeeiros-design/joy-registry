import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Gift, Sparkles, Users, Crown, Building2, Zap } from "lucide-react";
import heroImage from "@/assets/hero-gift-registry.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/12" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Column - Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-6">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Amor&Presente
              </h1>
            </div>

            <Badge variant="secondary" className="w-fit mx-auto lg:mx-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              A Plataforma Completa de Listas de Presentes
            </Badge>
            
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight text-balance">
              Sites de Presentes
              <span className="gradient-primary bg-clip-text text-transparent"> Profissionais </span>
              para Todos
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Seja você um <strong>assessor de eventos</strong> criando sites com sua marca própria, 
              ou uma <strong>pessoa</strong> planejando seu evento especial - temos a solução perfeita 
              com layouts únicos e pagamentos integrados sem taxas.
            </p>
          </div>

          {/* Target Audience Badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Building2 className="w-4 h-4 mr-2" />
              Assessores & Eventos
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
              <Heart className="w-4 h-4 mr-2" />
              Noivos & Famílias
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <Crown className="w-4 h-4 mr-2" />
              White Label
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="xl" 
              className="font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/auth'}
            >
              <Gift className="w-5 h-5 mr-2" />
              Começar Agora - Grátis
            </Button>
            <Button size="xl" variant="outline" className="font-medium border-2 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5">
              <Users className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">500+</div>
              <div className="text-sm text-muted-foreground font-medium">Sites Criados</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">0%</div>
              <div className="text-sm text-muted-foreground font-medium">Taxa de Comissão</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">24h</div>
              <div className="text-sm text-muted-foreground font-medium">Para Ativar</div>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-elegant">
            <img 
              src={heroImage} 
              alt="Mesa elegante com presentes organizados em tons suaves de rosa e dourado" 
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20" />
          </div>
          
          {/* Floating Cards */}
          <div className="absolute -top-6 -right-6 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Casamento Ana & João</div>
                <div className="text-xs text-muted-foreground">45 presentes restantes</div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Chá Casa Nova</div>
                <div className="text-xs text-muted-foreground">R$ 12.500 arrecadados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;