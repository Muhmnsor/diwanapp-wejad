
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
    <div className="flex items-center justify-between mb-2" dir="rtl">
      <h4 className="text-sm font-medium text-gray-700">المهام الفرعية</h4>
      
      {!isAddingSubtask && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-primary hover:text-primary-dark hover:bg-primary/5"
          onClick={onAddClick}
        >
          <Plus className="h-3.5 w-3.5 ml-1" />
          إضافة مهمة فرعية
        </Button>
      )}
    </div>
  );
};
