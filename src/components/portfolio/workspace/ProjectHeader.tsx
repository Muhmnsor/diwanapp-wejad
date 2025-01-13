import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectHeaderProps {
  title: string;
  onAddTask: () => void;
}

export const ProjectHeader = ({ title, onAddTask }: ProjectHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button onClick={onAddTask} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        إضافة مهمة
      </Button>
    </div>
  );
};