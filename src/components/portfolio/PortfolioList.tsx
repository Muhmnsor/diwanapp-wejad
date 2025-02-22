
import { useQuery } from "@tanstack/react-query";
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
      console.log('Fetching portfolios directly from Asana...');
      
      const { data: portfoliosData, error: fetchError } = await supabase
        .functions.invoke('get-workspace');

      if (fetchError) {
        console.error('Error fetching portfolios:', fetchError);
        throw fetchError;
      }

      return portfoliosData?.map((portfolio: any) => ({
        id: portfolio.gid,
        name: portfolio.name,
        description: portfolio.notes || null,
        asana_gid: portfolio.gid,
        total_projects: portfolio.items?.length || 0,
        created_at: portfolio.created_at,
        modified_at: portfolio.modified_at,
        asana_sync_enabled: true
      })) || [];
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
    staleTime: 10000, // اعتبار البيانات قديمة بعد 10 ثوانٍ
  });

  // إعادة تحديث البيانات عند التركيز على النافذة
  useEffect(() => {
    const onFocus = () => {
      console.log('Window focused, refetching portfolios from Asana...');
      refetch();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

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
