
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
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">
        {isGeneral ? "المهام العامة" : "المهام"}
      </h2>
      <Button onClick={onAddTask} size="sm">
        <Plus className="h-4 w-4 ml-2" />
        إضافة مهمة
      </Button>
    </div>
  );
};
