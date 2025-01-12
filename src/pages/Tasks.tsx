import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderKanban, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
}

interface PortfolioProject {
  portfolio_id: string;
  project_id: string;
}

const Tasks = () => {
  const [expandedPortfolios, setExpandedPortfolios] = useState<{ [key: string]: boolean }>({});

  // Fetch portfolios
  const { data: portfolios, isLoading: isLoadingPortfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Fetching portfolios...');
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        toast.error('حدث خطأ أثناء جلب المحافظ');
        throw error;
      }

      console.log('Fetched portfolios:', data);
      return data as Portfolio[];
    }
  });

  // Fetch portfolio projects
  const { data: portfolioProjects, isLoading: isLoadingPortfolioProjects } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: async () => {
      console.log('Fetching portfolio projects...');
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(`
          portfolio_id,
          project_id,
          projects (
            id,
            title,
            description
          )
        `);

      if (error) {
        console.error('Error fetching portfolio projects:', error);
        toast.error('حدث خطأ أثناء جلب المشاريع');
        throw error;
      }

      console.log('Fetched portfolio projects:', data);
      return data;
    }
  });

  const togglePortfolio = (portfolioId: string) => {
    setExpandedPortfolios(prev => ({
      ...prev,
      [portfolioId]: !prev[portfolioId]
    }));
  };

  const getProjectsForPortfolio = (portfolioId: string) => {
    return portfolioProjects
      ?.filter(pp => pp.portfolio_id === portfolioId)
      .map(pp => pp.projects) || [];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">المحافظ والمشاريع</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            محفظة جديدة
          </Button>
        </div>

        {isLoadingPortfolios || isLoadingPortfolioProjects ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !portfolios?.length ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <FolderKanban className="w-16 h-16 text-primary" />
            <p className="text-lg text-muted-foreground text-center">لا توجد محافظ حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {portfolios.map((portfolio) => (
              <Collapsible
                key={portfolio.id}
                open={expandedPortfolios[portfolio.id]}
                onOpenChange={() => togglePortfolio(portfolio.id)}
              >
                <Card className="p-4">
                  <CollapsibleTrigger className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                    </div>
                    {expandedPortfolios[portfolio.id] ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-2">
                    {portfolio.description && (
                      <p className="text-muted-foreground mb-4">{portfolio.description}</p>
                    )}
                    
                    <div className="grid gap-2">
                      {getProjectsForPortfolio(portfolio.id).map((project) => (
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
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;