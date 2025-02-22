
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { EditPortfolioDialog } from "./EditPortfolioDialog";
import { PortfolioCard } from "./components/PortfolioCard";
import { LoadingState } from "./components/LoadingState";

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
      console.log('🔄 Fetching portfolios...');
      
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_projects!portfolio_projects_portfolio_id_fkey(count),
          portfolio_only_projects!portfolio_only_projects_portfolio_id_fkey(count)
        `);

      if (portfoliosError) {
        console.error('❌ Error fetching portfolios:', portfoliosError);
        throw portfoliosError;
      }

      const portfoliosWithCounts = portfoliosData?.map(portfolio => {
        const regularProjectsCount = portfolio.portfolio_projects[0]?.count || 0;
        const onlyProjectsCount = portfolio.portfolio_only_projects[0]?.count || 0;
        const totalProjects = regularProjectsCount + onlyProjectsCount;

        console.log(`📊 Portfolio ${portfolio.name} counts:`, {
          regularProjects: regularProjectsCount,
          onlyProjects: onlyProjectsCount,
          total: totalProjects
        });

        return {
          ...portfolio,
          total_projects: totalProjects
        };
      }) || [];

      console.log('✅ Processed portfolios with counts:', portfoliosWithCounts);
      return portfoliosWithCounts;
    },
    // تحديث كل 30 ثانية
    refetchInterval: 30000,
    // تحديث عند العودة للصفحة
    refetchOnWindowFocus: true,
    // تحديث عند إعادة الاتصال
    refetchOnReconnect: true,
    // التأكد من تحديث البيانات بعد المزامنة
    staleTime: 0
  });

  const handleCardClick = (e: React.MouseEvent, portfolioId: string) => {
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/portfolios/${portfolioId}`);
    }
  };

  if (error) {
    toast.error('حدث خطأ أثناء تحميل المحافظ');
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios?.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            onEdit={setPortfolioToEdit}
            onDelete={setPortfolioToDelete}
            onClick={handleCardClick}
          />
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
