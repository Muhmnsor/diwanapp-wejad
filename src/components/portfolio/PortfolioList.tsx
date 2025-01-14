import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const PortfolioList = () => {
  const navigate = useNavigate();
  
  const { data: portfolios, isLoading, error } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Fetching portfolios...');
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_projects (
            count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      console.log('Fetched portfolios:', portfolios);
      return portfolios;
    }
  });

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios?.map((portfolio) => (
        <Card 
          key={portfolio.id} 
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/portfolios/${portfolio.id}`)}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-1">{portfolio.name}</h3>
              <p className="text-sm text-gray-500">
                {portfolio.description || 'لا يوجد وصف'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>المشاريع</span>
                <span>{portfolio.portfolio_projects?.[0]?.count || 0}</span>
              </div>
              <Progress 
                value={portfolio.sync_enabled ? 100 : 0} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 text-left">
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
  );
};