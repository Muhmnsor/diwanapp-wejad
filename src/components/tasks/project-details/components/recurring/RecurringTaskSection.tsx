
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RecurringTasksList } from "./RecurringTasksList";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { ProjectMember } from "../../hooks/useProjectMembers";
import { RefreshCw } from "lucide-react";

interface RecurringTaskSectionProps {
  projectId?: string;
  workspaceId?: string;
  projectMembers: ProjectMember[];
}

export const RecurringTaskSection = ({
  projectId,
  workspaceId,
  projectMembers
}: RecurringTaskSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">المهام المتكررة</h3>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          إضافة مهمة متكررة
        </Button>
      </div>
      
      <RecurringTasksList 
        projectId={projectId} 
        workspaceId={workspaceId} 
        projectMembers={projectMembers} 
      />
      
      <RecurringTaskDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        workspaceId={workspaceId}
        projectMembers={projectMembers}
      />
    </div>
  );
};
