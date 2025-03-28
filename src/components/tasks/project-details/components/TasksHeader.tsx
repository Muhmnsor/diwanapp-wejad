
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
  hideAddButton?: boolean; // خاصية للتحكم في ظهور زر الإضافة
  hideTitle?: boolean; // خاصية جديدة للتحكم في ظهور العنوان
}

export const TasksHeader = ({ onAddTask, isGeneral, hideAddButton, hideTitle }: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      {!hideTitle && <h2 className="text-xl font-bold">{isGeneral ? "المهام العامة" : "المهام"}</h2>}
      {!hideAddButton && (
        <Button 
          size="sm" 
          className="gap-1"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" /> إضافة مهمة {isGeneral ? "عامة" : ""}
        </Button>
      )}
    </div>
  );
};
