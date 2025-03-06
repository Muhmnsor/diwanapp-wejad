
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TaskProjectCardActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const TaskProjectCardActions = ({ onEdit, onDelete }: TaskProjectCardActionsProps) => {
  return (
    <div className="absolute top-2 left-2 flex gap-1 z-10 project-actions">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 text-gray-500" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};
