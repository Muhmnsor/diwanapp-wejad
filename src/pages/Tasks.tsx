
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
    console.log('🔄 Starting Asana sync...');
    try {
      // استخدام معرف مساحة العمل من إعدادات Asana
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('portfolios')
        .select('asana_gid')
        .single();

      if (workspaceError) {
        console.error('❌ Error fetching workspace ID:', workspaceError);
        toast.error('فشل في جلب معرف مساحة العمل');
        return;
      }

      if (!workspaceData?.asana_gid) {
        console.error('❌ No Asana workspace ID found');
        toast.error('لم يتم العثور على معرف مساحة العمل');
        return;
      }

      console.log('📥 Invoking sync with workspace ID:', workspaceData.asana_gid);
      const { error: syncError } = await supabase.functions.invoke('get-workspace', {
        body: { workspaceId: workspaceData.asana_gid }
      });

      if (syncError) {
        console.error('❌ Error syncing with Asana:', syncError);
        toast.error('فشل في المزامنة مع Asana');
        return;
      }

      console.log('✅ Sync completed successfully');
      toast.success('تم المزامنة بنجاح');
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
