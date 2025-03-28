
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
}

export const TasksHeader = ({ onAddTask, isGeneral }: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">{isGeneral ? "المهام العامة" : "المهام"}</h2>
      <Button 
        size="sm" 
        className="gap-1"
        onClick={onAddTask}
      >
        <Plus className="h-4 w-4" /> إضافة مهمة {isGeneral ? "عامة" : ""}
      </Button>
    </div>
  );
};
