import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Home, Laptop, Camera, Palette, Sparkles, Heart, Coffee } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const categoryIcons: Record<string, any> = {
  "Eletrodomésticos": Home,
  "Tecnologia": Laptop,
  "Fotografia": Camera,
  "Decoração": Palette,
  "Brincadeiras": Sparkles,
  "Pessoal": Heart,
  "Literatura": Coffee,
  "Natureza": Gift
};

export const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onCategorySelect(null)}
          className="mb-2 transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <Gift className="h-4 w-4 mr-2" />
          Todas as Categorias
          <Badge variant="secondary" className="ml-2">
            {categories.length}
          </Badge>
        </Button>
        
        {categories.map((category) => {
          const IconComponent = categoryIcons[category] || Gift;
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => onCategorySelect(category)}
              className="mb-2 transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {category}
            </Button>
          );
        })}
      </div>
    </div>
  );
};