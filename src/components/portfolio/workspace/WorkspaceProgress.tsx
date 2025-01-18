import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WorkspaceProgressProps {
  tasks: any[];
}

export const WorkspaceProgress = ({ tasks }: WorkspaceProgressProps) => {
  const progress = tasks ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0;
  
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>تقدم المهام</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
};