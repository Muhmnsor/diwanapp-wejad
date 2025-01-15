import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { EditPortfolioDialog } from "./EditPortfolioDialog";

export const PortfolioList = () => {
  const navigate = useNavigate();
  const [portfolioToDelete, setPortfolioToDelete] = useState<{
    id: string;
    name: string;
    asanaGid: string | null;
  } | null>(null);
  const [portfolioToEdit, setPortfolioToEdit] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);
  
  const { data: portfolios, isLoading, error } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Fetching portfolios...');
      
      // First, get all portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_projects:portfolio_projects(count),
          portfolio_only_projects:portfolio_only_projects(count)
        `);

      if (portfoliosError) {
        console.error('Error fetching portfolios:', portfoliosError);
        throw portfoliosError;
      }

      // Process the data to calculate total projects
      const portfoliosWithCounts = portfoliosData.map(portfolio => {
        const regularProjectsCount = portfolio.portfolio_projects[0]?.count || 0;
        const onlyProjectsCount = portfolio.portfolio_only_projects[0]?.count || 0;
        const totalProjects = regularProjectsCount + onlyProjectsCount;

        console.log(`Portfolio ${portfolio.name} has:`, {
          regularProjects: regularProjectsCount,
          onlyProjects: onlyProjectsCount,
          total: totalProjects
        });

        return {
          ...portfolio,
          total_projects: totalProjects
        };
      });

      console.log('Processed portfolios with counts:', portfoliosWithCounts);
      return portfoliosWithCounts;
    }
  });

  const handleCardClick = (e: React.MouseEvent, portfolioId: string) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/portfolios/${portfolioId}`);
    }
  };

  if (error) {
    toast.error('حدث خطأ أثناء تحميل المحافظ');
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios?.map((portfolio) => (
          <Card 
            key={portfolio.id} 
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={(e) => handleCardClick(e, portfolio.id)}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg mb-1">{portfolio.name}</h3>
                  <p className="text-sm text-gray-500">
                    {portfolio.description || 'لا يوجد وصف'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPortfolioToEdit(portfolio);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPortfolioToDelete({
                        id: portfolio.id,
                        name: portfolio.name,
                        asanaGid: portfolio.asana_gid
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المشاريع</span>
                  <span>{portfolio.total_projects}</span>
                </div>
                <Progress 
                  value={portfolio.sync_enabled ? 100 : 0} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 text-right">
                  {portfolio.sync_enabled ? 'متزامن مع Asana' : 'غير متزامن'}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {portfolios?.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            لا توجد محافظ. قم بإضافة محفظة جديدة للبدء.
          </div>
        )}
      </div>

      {portfolioToDelete && (
        <DeletePortfolioDialog
          open={!!portfolioToDelete}
          onOpenChange={() => setPortfolioToDelete(null)}
          portfolioId={portfolioToDelete.id}
          portfolioName={portfolioToDelete.name}
          asanaGid={portfolioToDelete.asanaGid}
        />
      )}

      {portfolioToEdit && (
        <EditPortfolioDialog
          open={!!portfolioToEdit}
          onOpenChange={() => setPortfolioToEdit(null)}
          portfolio={portfolioToEdit}
        />
      )}
    </>
  );
};