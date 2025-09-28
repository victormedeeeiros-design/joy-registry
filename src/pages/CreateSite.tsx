import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Home } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "", 
    eventDate: "", 
    hostNames: "", 
    heroImages: [] as File[], // Imagens do hero
    galleryImages: [] as File[], // Imagens da galeria/nossa história
  });

  const layoutNames = {
    "cha-casa-nova": "Chá de Casa Nova"
  };

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files: File[], userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
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

    if (!formData.title.trim() || !formData.eventType || !formData.hostNames.trim()) {
      toast({
        title: "Erro",
        description: "Título, tipo de evento e nomes dos anfitriões são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload das imagens primeiro
      let heroImageUrls: string[] = [];
      let galleryImageUrls: string[] = [];
      
      if (formData.heroImages.length > 0) {
        heroImageUrls = await handleFileUpload(formData.heroImages, profile.id);
      }
      
      if (formData.galleryImages.length > 0) {
        galleryImageUrls = await handleFileUpload(formData.galleryImages, profile.id);
      }

      const { data, error } = await supabase
        .from('sites')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            layout_id: layoutId,
            creator_id: profile.id,
            is_active: true,
            hero_images: heroImageUrls,
            story_images: galleryImageUrls,
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
      setUploading(false);
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
                {/* Tipo de Evento */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">
                    Tipo de Evento <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cha-casa-nova">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Chá de Casa Nova
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecione o tipo de celebração para personalizar seu site
                  </p>
                </div>

                {/* Nomes dos Anfitriões */}
                <div className="space-y-2">
                  <Label htmlFor="hostNames">
                    Nomes dos Anfitriões <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hostNames"
                    placeholder="Ex: Maria e João, Família Silva"
                    value={formData.hostNames}
                    onChange={(e) => handleInputChange("hostNames", e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quem está organizando este evento?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título do Site <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Chá de Casa Nova da Maria e João"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este será o título principal do seu site de presentes
                  </p>
                </div>

                {/* Data do Evento (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Data do Evento (opcional)</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quando será a celebração?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mensagem Especial (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Estamos muito felizes por iniciar essa nova etapa em nossa casa nova! Venham celebrar conosco e nos ajudar a tornar nossa casa ainda mais especial."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uma mensagem carinhosa para seus convidados
                  </p>
                </div>

                {/* Upload de Imagens do Hero */}
                <div className="space-y-2">
                  <Label htmlFor="heroImages">Imagens do Hero (Fundo Principal)</Label>
                  <Input
                    id="heroImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleInputChange("heroImages", Array.from(e.target.files || []))}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha de 1 a 5 imagens que vão aparecer no fundo da página principal (recomendado: 1920x1080px)
                  </p>
                  {formData.heroImages.length > 0 && (
                    <p className="text-sm text-green-600">
                      {formData.heroImages.length} imagen{formData.heroImages.length > 1 ? 's' : ''} selecionada{formData.heroImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Upload de Imagens da Galeria */}
                <div className="space-y-2">
                  <Label htmlFor="galleryImages">Fotos da Nossa História (opcional)</Label>
                  <Input
                    id="galleryImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleInputChange("galleryImages", Array.from(e.target.files || []))}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fotos do casal, da casa, momentos especiais para contar sua história
                  </p>
                  {formData.galleryImages.length > 0 && (
                    <p className="text-sm text-green-600">
                      {formData.galleryImages.length} imagen{formData.galleryImages.length > 1 ? 's' : ''} selecionada{formData.galleryImages.length > 1 ? 's' : ''}
                    </p>
                  )}
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
                    disabled={loading || uploading || !formData.title.trim() || !formData.eventType || !formData.hostNames.trim()}
                    className="flex-1 gap-2"
                  >
                    {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {uploading ? "Enviando imagens..." : loading ? "Criando..." : "Criar Site"}
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