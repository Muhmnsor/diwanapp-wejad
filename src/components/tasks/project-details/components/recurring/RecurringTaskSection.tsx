import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTaskSectionProps {
  projectId: string;
  projectMembers: ProjectMember[];
  onRecurringTaskAdded: () => void;
}

export const RecurringTaskSection: React.FC<RecurringTaskSectionProps> = ({
  projectId,
  projectMembers,
  onRecurringTaskAdded,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateRecurringTask = () => {
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">المهام المتكررة</h3>
        <Button onClick={handleCreateRecurringTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة متكررة
        </Button>
      </div>

      <RecurringTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        projectMembers={projectMembers}
        onRecurringTaskAdded={onRecurringTaskAdded}
      />
    </div>
  );
};
