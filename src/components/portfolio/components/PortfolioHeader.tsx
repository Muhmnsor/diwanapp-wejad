import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AddPortfolioDialog } from '../AddPortfolioDialog';
import { useState } from 'react';

interface PortfolioHeaderProps {
  onSync: () => void;
}

export const PortfolioHeader = ({ onSync }: PortfolioHeaderProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">المحافظ</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
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