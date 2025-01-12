import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioCard } from "./PortfolioCard";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PortfolioDialogs } from "./PortfolioDialogs";
import { Portfolio } from "@/types/portfolio";

export const PortfolioList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  const { data: portfolios, isLoading: isLoadingPortfolios, refetch: refetchPortfolios } = useQuery({
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

  const syncPortfolios = async () => {
    try {
      const { error } = await supabase.functions.invoke('sync-asana-portfolios')
      
      if (error) {
        console.error('Error syncing portfolios:', error);
        toast.error('حدث خطأ أثناء مزامنة المحافظ');
        return;
      }

      toast.success('تم مزامنة المحافظ بنجاح');
      refetchPortfolios();
      
    } catch (error) {
      console.error('Error syncing portfolios:', error);
      toast.error('حدث خطأ أثناء مزامنة المحافظ');
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">المحافظ والمشاريع</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={syncPortfolios}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            مزامنة مع Asana
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            محفظة جديدة
          </Button>
        </div>
      </div>

      {isLoadingPortfolios ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : !portfolios?.length ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 text-primary">📁</div>
          <p className="text-lg text-muted-foreground text-center">لا توجد محافظ حالياً</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={() => {
                setSelectedPortfolio(portfolio);
                setShowEditDialog(true);
              }}
              onDelete={() => {
                setSelectedPortfolio(portfolio);
                setShowDeleteDialog(true);
              }}
            />
          ))}
        </div>
      )}

      <PortfolioDialogs
        showCreateDialog={showCreateDialog}
        showEditDialog={showEditDialog}
        showDeleteDialog={showDeleteDialog}
        selectedPortfolio={selectedPortfolio}
        onCloseCreate={() => setShowCreateDialog(false)}
        onCloseEdit={() => {
          setShowEditDialog(false);
          setSelectedPortfolio(null);
        }}
        onCloseDelete={() => {
          setShowDeleteDialog(false);
          setSelectedPortfolio(null);
        }}
        onSuccess={() => {
          refetchPortfolios();
        }}
      />
    </div>
  );
};