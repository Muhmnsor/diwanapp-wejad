
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
}

export const TasksHeader = ({
  onAddTask,
  isGeneral
}: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium">
        {isGeneral ? "المهام العامة" : "مهام المشروع"}
      </h3>
      <Button variant="outline" size="sm" onClick={onAddTask}>
        <Plus className="h-4 w-4 ml-1" />
        إضافة مهمة
      </Button>
    </div>
  );
};
