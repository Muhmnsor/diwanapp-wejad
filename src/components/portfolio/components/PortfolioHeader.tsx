import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AddPortfolioDialog } from '../AddPortfolioDialog';

interface PortfolioHeaderProps {
  onSync: () => void;
}

export const PortfolioHeader = ({ onSync }: PortfolioHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">المحافظ</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onSync}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          مزامنة مع Asana
        </Button>
        <AddPortfolioDialog />
      </div>
    </div>
  );
};