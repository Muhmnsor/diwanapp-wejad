import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from './tasks/AddTaskDialog';
import { useWorkspaceTasks } from './tasks/useWorkspaceTasks';
import { TaskList } from './tasks/TaskList';

export const PortfolioTasks = ({ workspaceId }: { workspaceId: string }) => {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const { data: tasks, isLoading, refetch } = useWorkspaceTasks(workspaceId);

  const handleTaskAdded = async () => {
    await refetch();
  };

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">المهام</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
      </div>

      <TaskList tasks={tasks || []} />

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        workspaceId={workspaceId}
        onSuccess={handleTaskAdded}
      />
    </div>
  );
};