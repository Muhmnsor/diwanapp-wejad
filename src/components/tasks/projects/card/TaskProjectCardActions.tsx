import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2 } from "lucide-react";
import { useWorkspacePermissions } from "@/hooks/tasks/useWorkspacePermissions";

interface TaskProjectCardActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onCopy?: (e: React.MouseEvent) => void;
  workspaceId: string;
}

export const TaskProjectCardActions = ({ 
  onEdit, 
  onDelete, 
  onCopy, 
  workspaceId 
}: TaskProjectCardActionsProps) => {
  const { canManageProjects } = useWorkspacePermissions(workspaceId);

  if (!canManageProjects) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 flex gap-1 z-10 project-actions opacity-0 group-hover:opacity-100 transition-opacity">
      {onCopy && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={onCopy}
          title="نسخ المشروع"
        >
          <Copy className="h-4 w-4 text-gray-500" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        onClick={onEdit}
        title="تعديل المشروع"
      >
        <Edit className="h-4 w-4 text-gray-500" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        onClick={onDelete}
        title="حذف المشروع"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};
