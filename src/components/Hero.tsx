import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Gift, Sparkles, Users } from "lucide-react";
import heroImage from "@/assets/hero-gift-registry.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Column - Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit mx-auto lg:mx-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma de Presentes Personalizados
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-balance">
              Crie Sites de
              <span className="gradient-primary bg-clip-text text-transparent"> Presentes </span>
              Únicos
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transforme momentos especiais em experiências inesquecíveis. 
              Crie sites personalizados para casamentos, chás de bebê, bodas e celebrações únicas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="xl" variant="elegant" className="font-semibold">
              <Gift className="w-5 h-5 mr-2" />
              Criar Meu Site de Presentes
            </Button>
            <Button size="xl" variant="outline" className="font-medium">
              <Users className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Sites Criados</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold text-primary">15k+</div>
              <div className="text-sm text-muted-foreground">Presentes Dados</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
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