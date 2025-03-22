
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
  hideAddButton?: boolean;
}

export const TasksHeader = ({ onAddTask, isGeneral = false, hideAddButton = false }: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">
        {isGeneral ? "المهام" : "مهام المشروع"}
      </h3>
      
      {!hideAddButton && (
        <Button onClick={onAddTask} size="sm" className="rtl">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
      )}
    </div>
  );
};
