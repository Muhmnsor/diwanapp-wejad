
import { ArrowRight, Briefcase, Calendar } from "lucide-react";
import { formatDueDate } from "../../utils/taskFormatters";
import { Badge } from "@/components/ui/badge";

interface TaskMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask: boolean;
  parentTaskId?: string | null;
}

export const TaskMetadata = ({ dueDate, projectName, isSubtask, parentTaskId }: TaskMetadataProps) => {
  return (
    <div className="space-y-2">
      {projectName && projectName !== 'مشروع غير محدد' && (
        <Badge variant="outline" className="flex items-center text-sm bg-blue-50 hover:bg-blue-100 border-blue-200">
          <Briefcase className="h-3.5 w-3.5 ml-1 text-blue-500" />
          <span className="font-medium">{projectName}</span>
        </Badge>
      )}
      
      <div className="flex flex-wrap items-center gap-4">
        {dueDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 ml-1" />
            <span>{formatDueDate(dueDate)}</span>
          </div>
        )}
        
        {isSubtask && parentTaskId && (
          <div className="flex items-center text-sm text-blue-500">
            <ArrowRight className="h-4 w-4 ml-1" />
            <span>تابعة لمهمة رئيسية</span>
          </div>
        )}
      </div>
    </div>
  );
};
