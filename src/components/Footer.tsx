import { Heart, Gift } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Presentes Únicos</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-end">
              Criado com <Heart className="w-4 h-4 text-primary fill-current" /> para momentos especiais
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              © 2024 Plataforma de Presentes Únicos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;