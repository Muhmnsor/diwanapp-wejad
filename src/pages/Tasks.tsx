
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import { PortfolioHeader } from "@/components/portfolio/components/PortfolioHeader";
import { useState } from "react";
import { AddPortfolioDialog } from "@/components/portfolio/AddPortfolioDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Tasks = () => {
  const [isAddPortfolioDialogOpen, setIsAddPortfolioDialogOpen] = useState(false);

  const handleSync = async () => {
    console.log('🔄 Starting Asana synchronization...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-workspace');
      
      if (error) {
        console.error('❌ Error during sync:', error);
        toast.error('فشل في المزامنة مع Asana');
        return;
      }

      if (data.message === 'No changes since last sync') {
        console.log('✨ No changes detected');
        toast.success('لا توجد تغييرات جديدة');
        return;
      }

      console.log('📊 Sync completed successfully:', data);
      toast.success(`تم مزامنة ${data.portfolios.length} محفظة بنجاح`);

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('حدث خطأ غير متوقع أثناء المزامنة');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <PortfolioHeader onSync={handleSync} />
        <PortfolioList />

        <AddPortfolioDialog
          open={isAddPortfolioDialogOpen}
          onOpenChange={setIsAddPortfolioDialogOpen}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
