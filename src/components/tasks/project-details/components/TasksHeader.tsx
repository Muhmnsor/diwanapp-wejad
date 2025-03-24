
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
      <h3 className="text-xl font-semibold">
        {isGeneral ? "المهام" : "مهام الاجتماع"}
      </h3>
      <Button onClick={onAddTask} variant="outline" size="sm">
        <Plus className="h-4 w-4 ml-1" />
        {isGeneral ? "إضافة مهمة" : "إضافة مهمة للاجتماع"}
      </Button>
    </div>
  );
};
