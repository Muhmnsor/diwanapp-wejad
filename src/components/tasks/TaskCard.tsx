import { Card } from "@/components/ui/card";
import { TaskCardHeader } from "./components/TaskCardHeader";
import { TaskCardBadges } from "./components/TaskCardBadges";
import { TaskCardContent } from "./components/TaskCardContent";
import { useAsanaApi } from "@/hooks/useAsanaApi";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    asana_gid: string | null;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const { updateTask } = useAsanaApi();

  const handleSync = async () => {
    if (task.asana_gid) {
      await updateTask(task.id, task.status);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row items-center justify-between p-6">
        <TaskCardHeader title={task.title} status={task.status} />
        <TaskCardBadges 
          status={task.status} 
          asanaGid={task.asana_gid} 
          onSync={handleSync}
        />
      </div>
      <TaskCardContent 
        description={task.description} 
        dueDate={task.due_date} 
      />
    </Card>
  );
};