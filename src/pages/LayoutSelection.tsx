import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Palette, Grid3X3, Layers } from "lucide-react";
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
      id: "modern-grid",
      name: "Grade Moderna",
      description: "Layout em grade limpo e moderno, perfeito para exibir produtos de forma organizada",
      preview: "🎁 Grid layout with clean cards",
      features: ["Grade responsiva", "Cards limpos", "Foco nos produtos", "Mobile-first"],
      recommended: true
    },
    {
      id: "story-driven",
      name: "História Personalizada",
      description: "Layout que conta uma história, ideal para casamentos e celebrações especiais",
      preview: "💕 Story-based with timeline",
      features: ["Seção de história", "Timeline visual", "Fotos personalizadas", "Narrativa envolvente"]
    },
    {
      id: "minimal-elegant",
      name: "Minimalista Elegante",
      description: "Design clean e sofisticado, focado na simplicidade e elegância",
      preview: "✨ Clean minimal design",
      features: ["Design limpo", "Tipografia elegante", "Cores suaves", "Navegação intuitiva"]
    }
  ];

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
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
              className={`cursor-pointer transition-all border-2 ${
                selectedLayout === layout.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
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
                    {layout.id === "modern-grid" && <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground" />}
                    {layout.id === "story-driven" && <Layers className="h-12 w-12 mx-auto text-muted-foreground" />}
                    {layout.id === "minimal-elegant" && <Palette className="h-12 w-12 mx-auto text-muted-foreground" />}
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
            disabled={!selectedLayout}
            className="px-8"
          >
            Continuar com Layout Selecionado
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelection;