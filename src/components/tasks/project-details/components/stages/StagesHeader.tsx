
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StagesHeaderProps {
  canManageStages: () => boolean;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
}

export const StagesHeader = ({ 
  canManageStages, 
  isAdding, 
  setIsAdding 
}: StagesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">مراحل المشروع</h3>
      {canManageStages() && !isAdding && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> إضافة مرحلة
        </Button>
      )}
    </div>
  );
};
