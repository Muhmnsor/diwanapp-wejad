
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw } from 'lucide-react';
import { AddPortfolioDialog } from '../AddPortfolioDialog';
import { useState } from 'react';

interface PortfolioHeaderProps {
  onSync?: () => void;
}

export const PortfolioHeader = ({ onSync }: PortfolioHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">المحافظ</h2>
      <div className="flex gap-2">
        {onSync && (
          <Button
            variant="outline"
            onClick={onSync}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            تحديث
          </Button>
        )}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة محفظة
        </Button>
        <AddPortfolioDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </div>
  );
};
