import { Calendar, Clock, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import ProjectEditDialog from "./dialogs/ProjectEditDialog";

interface TaskProjectInfoProps {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  projectStartDate: string | null;
  projectDueDate: string | null;
  projectStatus: string;
  projectManagerId: string | null;
  projectManagerName: string | null;
}

export const TaskProjectInfo = ({
  projectId,
  projectName,
  projectDescription,
  projectStartDate,
  projectDueDate,
  projectStatus,
  projectManagerId,
  projectManagerName,
}: TaskProjectInfoProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="bg-card rounded-md shadow-sm p-4 rtl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">{projectName}</h2>
          {projectDescription && (
            <p className="text-sm text-muted-foreground mt-1">
              {projectDescription}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
          تعديل المشروع
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {projectStartDate ? formatDate(projectStartDate) : "لم يتم تحديد تاريخ البدء"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {projectDueDate ? formatDate(projectDueDate) : "لم يتم تحديد تاريخ التسليم"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User2 className="h-4 w-4 text-muted-foreground" />
          <span>
            {projectManagerName ? projectManagerName : "لم يتم تحديد مدير المشروع"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{projectStatus}</Badge>
        </div>
      </div>

      <ProjectEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        project={{
          id: projectId,
          name: projectName,
          description: projectDescription,
          startDate: projectStartDate,
          dueDate: projectDueDate,
          status: projectStatus,
          managerId: projectManagerId,
          managerName: projectManagerName,
        }}
      />
    </div>
  );
};
