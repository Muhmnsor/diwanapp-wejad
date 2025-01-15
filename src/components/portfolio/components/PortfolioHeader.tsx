import { Button } from '@/components/ui/button';
import { RefreshCw, Link } from 'lucide-react';
import { AddPortfolioDialog } from '../AddPortfolioDialog';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PortfolioHeaderProps {
  onSync: () => void;
}

export const PortfolioHeader = ({ onSync }: PortfolioHeaderProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingUpWebhook, setIsSettingUpWebhook] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const setupWebhook = async () => {
    setIsSettingUpWebhook(true);
    try {
      console.log('🔄 Setting up Asana webhook...');
      const { data, error } = await supabase.functions.invoke('setup-asana-webhook');

      if (error) {
        console.error('❌ Error setting up webhook:', error);
        toast.error('فشل في إعداد webhook');
        throw error;
      }

      console.log('✅ Successfully set up webhook:', data);
      toast.success('تم إعداد webhook بنجاح');
    } catch (error) {
      console.error('❌ Error in setupWebhook:', error);
      toast.error('حدث خطأ أثناء إعداد webhook');
    } finally {
      setIsSettingUpWebhook(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">المحافظ</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={setupWebhook}
          disabled={isSettingUpWebhook}
          className="flex items-center gap-2"
        >
          <Link className="h-4 w-4 ml-2" />
          {isSettingUpWebhook ? 'جاري الإعداد...' : 'إعداد Webhook'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ml-2 ${isSyncing ? 'animate-spin' : ''}`} />
          مزامنة مع Asana
        </Button>
        <AddPortfolioDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </div>
  );
};