import { Card } from "@/components/ui/card";
import { Portfolio } from "@/types/portfolio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight, FolderKanban, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
}

interface Project {
  id: string;
  title: string;
  description?: string;
}

export const PortfolioCard = ({ portfolio, onEdit, onDelete }: PortfolioCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const { data: portfolioProjects } = useQuery({
    queryKey: ['portfolio-projects', portfolio.id],
    queryFn: async () => {
      console.log('Fetching portfolio projects...');
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(`
          portfolio_id,
          project_id,
          projects:projects (
            id,
            title,
            description
          )
        `)
        .eq('portfolio_id', portfolio.id);

      if (error) {
        console.error('Error fetching portfolio projects:', error);
        throw error;
      }

      return data;
    }
  });

  const projects = portfolioProjects?.map(pp => pp.projects) || [];

  const handleCardClick = () => {
    navigate(`/portfolios/${portfolio.id}`);
  };

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{portfolio.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {portfolio.description && (
        <p className="text-muted-foreground mt-2">{portfolio.description}</p>
      )}
    </Card>
  );
};