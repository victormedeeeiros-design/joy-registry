import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Home, Calendar, Gift, User, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Site {
  id: string;
  title: string;
  color_scheme?: string;
}

interface SiteUser {
  id: string;
  name: string;
  email: string;
}

interface MobileMenuDrawerProps {
  site: Site;
  activeSection: string;
  scrollToSection: (section: string) => void;
  siteUser: SiteUser | null;
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
  toast: (options: any) => void;
}

export const MobileMenuDrawer = ({ 
  site, 
  activeSection, 
  scrollToSection, 
  siteUser, 
  signOut, 
  navigate, 
  toast 
}: MobileMenuDrawerProps) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'story', label: 'Recepção', icon: Heart },
    { id: 'gifts', label: 'Lista de presentes', icon: Gift },
    { id: 'rsvp', label: 'Confirme sua presença', icon: Calendar },
  ];

  const handleMenuClick = (sectionId: string) => {
    if (sectionId === 'rsvp') {
      // Scroll para a seção RSVP que está dentro da story
      const element = document.getElementById('story');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Depois scroll um pouco mais para baixo para chegar no RSVP
        setTimeout(() => {
          window.scrollBy(0, 200);
        }, 500);
      }
    } else {
      scrollToSection(sectionId);
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-current hover:bg-primary/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 bg-primary/10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-sloop text-lg">
                  {site.title.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-left font-sloop text-lg text-foreground">
                  {site.title}
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Celebração Especial
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200 ${
                      isActive ? 'bg-primary/10 text-primary border-l-4 border-l-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <IconComponent className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={isActive ? 'text-primary font-semibold' : 'text-foreground'}>
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t bg-muted/30">
            {siteUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Avatar className="w-8 h-8 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {siteUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {siteUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {siteUser.email}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start gap-2 h-10 text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await signOut();
                    toast({
                      title: "Logout realizado",
                      description: "Você foi desconectado com sucesso.",
                    });
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2 h-12"
                  onClick={() => {
                    localStorage.setItem('currentSiteId', site.id);
                    navigate(`/guest-login?siteId=${site.id}`);
                    setOpen(false);
                  }}
                >
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
                <div className="border-t pt-3">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 h-10 text-xs"
                    onClick={() => {
                      navigate('/');
                      setOpen(false);
                    }}
                  >
                    ✨ Criar site
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Entre para confirmar sua presença
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};