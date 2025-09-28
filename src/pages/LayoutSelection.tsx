import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Home, Heart, Baby, Cake, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
  recommended?: boolean;
}

const LayoutSelection = () => {
  const navigate = useNavigate();
  const [selectedLayout, setSelectedLayout] = useState<string>("");

const layouts: LayoutOption[] = [
    {
      id: "cha-casa-nova",
      name: "Chá de Casa Nova",
      description: "Layout especial para celebrar sua nova casa, com seções para presentes essenciais e decoração",
      preview: "🏠 Layout completo para casa nova",
      features: ["Seções organizadas", "Lista de presentes", "Fotos da casa", "Mensagem personalizada"],
      recommended: true
    },
    {
      id: "casamento",
      name: "Casamento",
      description: "Em breve - Layout elegante para listas de casamento",
      preview: "💒 Em desenvolvimento...",
      features: ["Em breve"],
      recommended: false
    },
    {
      id: "cha-bebe",
      name: "Chá de Bebê",
      description: "Em breve - Layout fofo para celebrar a chegada do bebê",
      preview: "👶 Em desenvolvimento...",
      features: ["Em breve"],
      recommended: false
    },
    {
      id: "aniversario",
      name: "Aniversário",
      description: "Em breve - Layout festivo para comemorações de aniversário",
      preview: "🎂 Em desenvolvimento...",
      features: ["Em breve"],
      recommended: false
    }
  ];

  const handleLayoutSelect = (layoutId: string) => {
    // Só permite selecionar chá de casa nova
    if (layoutId === "cha-casa-nova") {
      setSelectedLayout(layoutId);
    }
  };

  const handleContinue = () => {
    if (selectedLayout) {
      // Navegar para a próxima etapa de criação do site
      navigate(`/create-site?layout=${selectedLayout}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Escolha seu Layout</h1>
              <p className="text-muted-foreground">Selecione o design perfeito para seu site de presentes</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {layouts.map((layout) => (
            <Card 
              key={layout.id} 
              className={`transition-all border-2 ${
                layout.id === "cha-casa-nova" 
                  ? `cursor-pointer ${selectedLayout === layout.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"}`
                  : "opacity-60 cursor-not-allowed border-muted"
              }`}
              onClick={() => handleLayoutSelect(layout.id)}
            >
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {layout.name}
                      {layout.recommended && (
                        <Badge variant="default" className="text-xs">
                          Recomendado
                        </Badge>
                      )}
                      {layout.id !== "cha-casa-nova" && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Em Breve
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {layout.description}
                    </CardDescription>
                  </div>
                  {selectedLayout === layout.id && (
                    <div className="rounded-full bg-primary text-primary-foreground p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Preview placeholder */}
                <div className="bg-muted rounded-lg p-6 mb-4 text-center">
                  <div className="text-4xl mb-2">
                    {layout.id === "cha-casa-nova" && <Home className="h-12 w-12 mx-auto text-primary" />}
                    {layout.id === "casamento" && <Heart className="h-12 w-12 mx-auto text-muted-foreground" />}
                    {layout.id === "cha-bebe" && <Baby className="h-12 w-12 mx-auto text-muted-foreground" />}
                    {layout.id === "aniversario" && <Cake className="h-12 w-12 mx-auto text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{layout.preview}</p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recursos inclusos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {layout.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleContinue} 
            disabled={!selectedLayout || selectedLayout !== "cha-casa-nova"}
            className="px-8"
          >
            {selectedLayout === "cha-casa-nova" ? "Continuar com Chá de Casa Nova" : "Selecione um Layout Disponível"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelection;