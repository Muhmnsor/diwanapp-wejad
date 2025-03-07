
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2, LinkOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskDependenciesBadgeProps {
  taskId: string;
}

export const TaskDependenciesBadge = ({ taskId }: TaskDependenciesBadgeProps) => {
  const [dependenciesCount, setDependenciesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  
  useEffect(() => {
    const fetchDependenciesCount = async () => {
      try {
        const { count: blocksCount, error: blocksError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId);
          
        const { count: blockedByCount, error: blockedByError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('dependency_task_id', taskId);
          
        if (blocksError || blockedByError) throw blocksError || blockedByError;
        
        // Check if task is blocked by incomplete tasks
        const { data: blockingTasks, error: blockingError } = await supabase
          .from('task_dependencies')
          .select('dependency_task_id, tasks!inner(status)')
          .eq('task_id', taskId)
          .eq('dependency_type', 'blocked_by')
          .neq('tasks.status', 'completed');
          
        if (blockingError) throw blockingError;
        
        const totalCount = (blocksCount || 0) + (blockedByCount || 0);
        setDependenciesCount(totalCount);
        setIsBlocked(blockingTasks && blockingTasks.length > 0);
      } catch (error) {
        console.error("Error fetching dependencies count:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependenciesCount();
  }, [taskId]);
  
  if (isLoading || dependenciesCount === 0) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isBlocked ? "destructive" : "secondary"} 
            className="cursor-help"
          >
            {isBlocked ? (
              <LinkOff className="h-3 w-3 mr-1" />
            ) : (
              <Link2 className="h-3 w-3 mr-1" />
            )}
            {dependenciesCount} اعتمادية
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isBlocked ? (
            <p>هذه المهمة معطلة لأنها تعتمد على مهام لم تكتمل بعد</p>
          ) : (
            <p>هذه المهمة لديها {dependenciesCount} اعتماديات</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
