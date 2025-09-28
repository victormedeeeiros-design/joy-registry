import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreateSite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layoutId = searchParams.get("layout") || "modern-grid";
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const layoutNames = {
    "modern-grid": "Grade Moderna",
    "story-driven": "História Personalizada",
    "minimal-elegant": "Minimalista Elegante"
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do site é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('sites')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            layout_id: layoutId,
            creator_id: profile.id,
            is_active: true,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Site criado com sucesso!",
        description: "Seu site de presentes foi criado e já está ativo.",
      });

      // Redirecionar para o dashboard ou para a página de edição do site
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Erro ao criar site:', error);
      toast({
        title: "Erro ao criar site",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              onClick={() => navigate("/layouts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Site</h1>
              <p className="text-muted-foreground">
                Layout selecionado: {layoutNames[layoutId as keyof typeof layoutNames]}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Site</CardTitle>
              <CardDescription>
                Preencha as informações básicas do seu site de presentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSite} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título do Site <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Lista de Casamento da Maria e João"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este será o título principal do seu site de presentes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Celebre conosco este momento especial! Aqui estão os presentes que sonhamos para nossa nova casa."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uma breve descrição sobre o evento ou ocasião
                  </p>
                </div>

                {/* Layout Preview */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Layout Selecionado</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{layoutNames[layoutId as keyof typeof layoutNames]}</p>
                      <p className="text-sm text-muted-foreground">
                        {layoutId === "modern-grid" && "Layout em grade limpo e moderno"}
                        {layoutId === "story-driven" && "Layout que conta uma história"}
                        {layoutId === "minimal-elegant" && "Design clean e sofisticado"}
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/layouts")}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/layouts")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.title.trim()}
                    className="flex-1 gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Criar Site
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSite;