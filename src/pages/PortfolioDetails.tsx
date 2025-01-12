import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const PortfolioDetails = () => {
  const { id } = useParams();

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: projects, isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['portfolio-projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(`
          portfolio_id,
          project_id,
          projects:projects (
            id,
            title,
            description,
            image_url,
            start_date,
            end_date
          )
        `)
        .eq('portfolio_id', id);

      if (error) throw error;
      return data;
    }
  });

  const syncPortfolioProjects = async () => {
    try {
      const { error } = await supabase.functions.invoke('sync-asana-portfolio-projects', {
        body: { portfolioId: id }
      });

      if (error) throw error;

      toast.success('تم مزامنة المشاريع بنجاح');
      refetchProjects();
    } catch (error) {
      console.error('Error syncing portfolio projects:', error);
      toast.error('حدث خطأ أثناء مزامنة المشاريع');
    }
  };

  if (isLoadingPortfolio || isLoadingProjects) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">{portfolio?.name}</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={syncPortfolioProjects}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              مزامنة مع Asana
            </Button>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              مشروع جديد
            </Button>
          </div>
        </div>

        {portfolio?.description && (
          <p className="text-muted-foreground mb-6">{portfolio.description}</p>
        )}

        <div className="grid gap-4">
          {projects?.map((pp) => (
            <Card key={pp.project_id} className="p-4">
              <h3 className="font-semibold">{pp.projects.title}</h3>
              {pp.projects.description && (
                <p className="text-muted-foreground mt-2">{pp.projects.description}</p>
              )}
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetails;