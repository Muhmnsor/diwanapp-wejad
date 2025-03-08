
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { RecurringTasksList } from "./RecurringTasksList";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTaskSectionProps {
  projectId: string;
  projectMembers: ProjectMember[];
}

export const RecurringTaskSection = ({ projectId, projectMembers }: RecurringTaskSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="space-y-4 mt-6 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">المهام المتكررة</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            إضافة مهمة متكررة
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <RecurringTasksList 
          projectId={projectId} 
          projectMembers={projectMembers} 
        />
      )}
      
      <RecurringTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        projectMembers={projectMembers}
        onRecurringTaskAdded={() => setIsExpanded(true)}
      />
    </div>
  );
};
