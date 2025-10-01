import { Heart, Gift, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border/50 bg-gradient-to-br from-muted/30 to-muted/50">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Amor&Presente
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A plataforma completa para criar sites de presentes profissionais. 
              Para assessores, noivos e todas as celebrações especiais.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="w-4 h-4" />
              <span>Zero taxas • White Label • Layouts únicos</span>
            </div>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Soluções</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Para Assessores de Eventos</p>
              <p>• Para Noivos e Famílias</p>
              <p>• White Label Completo</p>
              <p>• Integração de Pagamentos</p>
              <p>• Layouts Profissionais</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@amorpresente.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>WhatsApp: (11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />  
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground flex items-center gap-2">
              Criado com <Heart className="w-4 h-4 text-primary fill-current" /> para momentos especiais
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Amor&Presente. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;