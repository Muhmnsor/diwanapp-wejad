
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { EditPortfolioDialog } from "./EditPortfolioDialog";
import { PortfolioCard } from "./components/PortfolioCard";
import { LoadingState } from "./components/LoadingState";

export const PortfolioList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  
  const { data: portfolios, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Fetching portfolios...');
      
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_projects!portfolio_projects_portfolio_id_fkey(count),
          portfolio_only_projects!portfolio_only_projects_portfolio_id_fkey(count)
        `)
        .order('created_at', { ascending: false });

      if (portfoliosError) {
        console.error('Error fetching portfolios:', portfoliosError);
        throw portfoliosError;
      }

      const portfoliosWithCounts = portfoliosData?.map(portfolio => {
        const regularProjectsCount = portfolio.portfolio_projects[0]?.count || 0;
        const onlyProjectsCount = portfolio.portfolio_only_projects[0]?.count || 0;
        const totalProjects = regularProjectsCount + onlyProjectsCount;

        console.log(`Portfolio ${portfolio.name} counts:`, {
          regularProjects: regularProjectsCount,
          onlyProjects: onlyProjectsCount,
          total: totalProjects
        });

        return {
          ...portfolio,
          total_projects: totalProjects
        };
      }) || [];

      console.log('Processed portfolios with counts:', portfoliosWithCounts);
      return portfoliosWithCounts;
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
    staleTime: 10000, // اعتبار البيانات قديمة بعد 10 ثوانٍ
  });

  // إعادة تحديث البيانات عند التركيز على النافذة
  useEffect(() => {
    const onFocus = () => {
      console.log('Window focused, refetching portfolios...');
      refetch();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  // الاستماع إلى تغييرات قاعدة البيانات في الوقت الفعلي
  useEffect(() => {
    const portfoliosChannel = supabase
      .channel('portfolios_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['portfolios'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(portfoliosChannel);
    };
  }, [queryClient]);

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
