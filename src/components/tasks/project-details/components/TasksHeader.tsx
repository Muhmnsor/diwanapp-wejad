
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
}

export const TasksHeader = ({
  onAddTask,
  isGeneral = false
}: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">
        {isGeneral ? 'المهام العامة' : 'المهام'}
      </h2>
      <Button onClick={onAddTask} className="shadow-sm hover:shadow-md transition-shadow">
        <Plus className="h-4 w-4 mr-2" />
        إضافة مهمة
      </Button>
    </div>
  );
};
