
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Rocket } from "lucide-react";

interface TaskProjectCardActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onLaunch?: (e: React.MouseEvent) => void;
  isDraft?: boolean;
}

export const TaskProjectCardActions = ({ 
  onEdit, 
  onDelete, 
  onCopy,
  onLaunch,
  isDraft 
}: TaskProjectCardActionsProps) => {
  return (
    <div className="absolute top-2 left-2 flex gap-1 z-10 project-actions">
      {isDraft && onLaunch && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={onLaunch}
          title="إطلاق المشروع"
        >
          <Rocket className="h-4 w-4 text-blue-500" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        onClick={onCopy}
        title="نسخ المشروع"
      >
        <Copy className="h-4 w-4 text-gray-500" />
      </Button>
      
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
