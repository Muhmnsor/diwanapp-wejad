
import { Calendar, Briefcase, FolderOpen, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask?: boolean;
  parentTaskId?: string | null;
  isGeneral?: boolean;
  requiresDeliverable?: boolean;
}

export const TaskMetadata = ({
  dueDate,
  projectName,
  isSubtask,
  parentTaskId,
  isGeneral,
  requiresDeliverable
}: TaskMetadataProps) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
      {dueDate && (
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(dueDate)}</span>
        </div>
      )}
      
      {projectName && !isGeneral && (
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{projectName}</span>
        </div>
      )}
      
      {isSubtask && parentTaskId && (
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <FolderOpen className="h-3.5 w-3.5" />
          <Link to={`/tasks/${parentTaskId}`} className="hover:underline">
            المهمة الأصلية
          </Link>
        </div>
      )}
      
      {requiresDeliverable && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="rounded-full bg-amber-50 border-amber-200 text-amber-600 px-2 py-0.5 text-[10px]">
                <FileDown className="h-3 w-3 mr-1" />
                المستلمات إلزامية
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>هذه المهمة تتطلب رفع مستلم واحد على الأقل للإكمال</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
