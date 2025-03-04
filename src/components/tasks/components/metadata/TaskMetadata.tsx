
import { ArrowRight, Briefcase, Calendar } from "lucide-react";
import { formatDueDate } from "../../utils/taskFormatters";

interface TaskMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask: boolean;
  parentTaskId?: string | null;
}

export const TaskMetadata = ({ dueDate, projectName, isSubtask, parentTaskId }: TaskMetadataProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {dueDate && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 ml-1" />
          <span>{formatDueDate(dueDate)}</span>
        </div>
      )}
      
      {projectName && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 ml-1" />
          <span>{projectName}</span>
        </div>
      )}
      
      {isSubtask && parentTaskId && (
        <div className="flex items-center text-sm text-blue-500">
          <ArrowRight className="h-4 w-4 ml-1" />
          <span>تابعة لمهمة رئيسية</span>
        </div>
      )}
    </div>
  );
};

