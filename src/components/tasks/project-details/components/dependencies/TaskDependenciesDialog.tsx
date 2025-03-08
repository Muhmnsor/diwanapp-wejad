
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Task } from "../../types/task";
import { DependencyProvider } from "./DependencyContext";
import { DependencyDialogHeader } from "./DependencyDialogHeader";
import { DependencySelector } from "./DependencySelector";
import { DependencyList } from "./DependencyList";
import { DependencyWarning } from "./DependencyWarning";
import { PermissionWarning } from "./PermissionWarning";
import { useDependencyContext } from "./DependencyContext";

interface TaskDependenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: string;
}

// This component renders the dialog content and uses the DependencyContext
const DependencyDialogContent = () => {
  const {
    dependencies,
    dependentTasks,
    canManageDependencies,
    removeDependency,
    getStatusBadge,
    isDependenciesLoading
  } = useDependencyContext();

  return (
    <div className="space-y-4 mt-4">
      {canManageDependencies ? (
        <DependencySelector />
      ) : (
        <PermissionWarning />
      )}
      
      <Separator />
      
      <DependencyList
        title="المهام التي تعتمد عليها هذه المهمة"
        tasks={dependencies}
        isLoading={isDependenciesLoading}
        emptyMessage="لا توجد اعتماديات حالياً"
        onRemove={canManageDependencies ? removeDependency : undefined}
        getStatusBadge={getStatusBadge}
      />
      
      <Separator />
      
      <DependencyList
        title="المهام التي تعتمد على هذه المهمة"
        tasks={dependentTasks}
        isLoading={isDependenciesLoading}
        emptyMessage="لا توجد مهام تعتمد على هذه المهمة"
        getStatusBadge={getStatusBadge}
        isDependent={true}
      />
      
      <DependencyWarning />
    </div>
  );
};

// The main dialog component that provides the context
export const TaskDependenciesDialog = ({
  open,
  onOpenChange,
  task,
  projectId
}: TaskDependenciesDialogProps) => {
  // Determine the actual projectId to use
  // For general tasks, pass an empty string to ensure we fetch other general tasks
  const effectiveProjectId = task.is_general ? "" : (projectId || task.project_id || "");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="min-w-[500px]">
        <DependencyProvider taskId={task.id} projectId={effectiveProjectId}>
          <DependencyDialogHeader />
          <DependencyDialogContent />
        </DependencyProvider>
      </DialogContent>
    </Dialog>
  );
};
