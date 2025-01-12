import { Card } from "@/components/ui/card";
import { Portfolio } from "@/types/portfolio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight, FolderKanban, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
}

export const PortfolioCard = ({ portfolio, onEdit, onDelete }: PortfolioCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
    >
      <Card className="p-4">
        <CollapsibleTrigger className="flex justify-between items-center w-full">
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
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-2">
          {portfolio.description && (
            <p className="text-muted-foreground mb-4">{portfolio.description}</p>
          )}
          
          <div className="grid gap-2">
            {projects.map((project) => (
              <Card key={project.id} className="p-4 hover:bg-accent transition-colors">
                <h4 className="font-medium">{project.title}</h4>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};