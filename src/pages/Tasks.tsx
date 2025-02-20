
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
    console.log('🔄 Checking Asana portfolios...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-workspace');
      
      if (error) {
        console.error('❌ Error fetching Asana portfolios:', error);
        toast.error('فشل في جلب المحافظ من Asana');
        return;
      }

      // عرض معلومات المحافظ في وحدة التحكم للفحص
      console.log('📊 Asana portfolios:', data.portfolios);
      toast.success(`تم العثور على ${data.portfolios.length} محفظة في Asana`);

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('حدث خطأ غير متوقع أثناء الفحص');
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
