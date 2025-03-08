
import { Dialog, DialogContent, Separator } from "@/components/ui/dialog";
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
const DialogContent = () => {
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[500px]" dir="rtl">
        <DependencyProvider taskId={task.id} projectId={projectId}>
          <DependencyDialogHeader />
          <DialogContent />
        </DependencyProvider>
      </DialogContent>
    </Dialog>
  );
};
