
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubtasksHeaderProps {
  onAddClick: () => void;
  isAddingSubtask: boolean;
}

export const SubtasksHeader: React.FC<SubtasksHeaderProps> = ({ 
  onAddClick, 
  isAddingSubtask 
}) => {
  return (
    <div className="flex items-center justify-between" dir="rtl">
      <h4 className="text-sm font-medium">المهام الفرعية</h4>
      
      {!isAddingSubtask && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs"
          onClick={onAddClick}
        >
          <Plus className="h-3.5 w-3.5 ml-1" />
          إضافة مهمة فرعية
        </Button>
      )}
    </div>
  );
};
