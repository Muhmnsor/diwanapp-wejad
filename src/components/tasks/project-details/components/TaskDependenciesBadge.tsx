
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2, Link2Off, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskDependenciesBadgeProps {
  taskId: string;
}

export const TaskDependenciesBadge = ({ taskId }: TaskDependenciesBadgeProps) => {
  const [dependenciesCount, setDependenciesCount] = useState(0);
  const [blockedByCount, setBlockedByCount] = useState(0);
  const [blocksCount, setBlocksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const fetchDependenciesCount = async () => {
      try {
        // Get blocking dependencies count
        const { count: blocksCount, error: blocksError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('dependency_task_id', taskId);
          
        // Get blocked by dependencies count
        const { count: blockedByCount, error: blockedByError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId);
          
        if (blocksError || blockedByError) throw blocksError || blockedByError;
        
        setBlocksCount(blocksCount || 0);
        setBlockedByCount(blockedByCount || 0);
        setDependenciesCount((blocksCount || 0) + (blockedByCount || 0));
        
        // Check if task is blocked by incomplete tasks
        const { data: blockingTasks, error: blockingError } = await supabase
          .from('task_dependencies')
          .select('dependency_task_id, tasks!inner(status)')
          .eq('task_id', taskId)
          .eq('dependency_type', 'blocked_by')
          .neq('tasks.status', 'completed');
          
        if (blockingError) throw blockingError;
        
        setIsBlocked(blockingTasks && blockingTasks.length > 0);
        
        // Check if this task is complete
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('status')
          .eq('id', taskId)
          .single();
          
        if (taskError) throw taskError;
        
        setIsComplete(taskData.status === 'completed');
      } catch (error) {
        console.error("Error fetching dependencies count:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependenciesCount();
  }, [taskId]);
  
  if (isLoading || dependenciesCount === 0) return null;
  
  let variant = "secondary";
  let icon = <Link2 className="h-3 w-3 mr-1" />;
  let tooltipText = `هذه المهمة لديها ${dependenciesCount} اعتماديات`;
  
  if (isBlocked) {
    variant = "destructive";
    icon = <Link2Off className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة معطلة لأنها تعتمد على مهام لم تكتمل بعد";
  } else if (isComplete && blocksCount > 0) {
    variant = "outline";
    icon = <Clock className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مكتملة ويعتمد عليها مهام أخرى";
  } else if (blocksCount > 0) {
    variant = "secondary";
    icon = <AlertCircle className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مطلوبة لإكمال مهام أخرى";
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={variant}
            className="cursor-help"
          >
            {icon}
            {blockedByCount > 0 && <span className="mr-1">{blockedByCount}↑</span>}
            {blocksCount > 0 && <span>{blocksCount}↓</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
          {blockedByCount > 0 && (
            <p className="text-xs mt-1">تعتمد على {blockedByCount} مهام</p>
          )}
          {blocksCount > 0 && (
            <p className="text-xs mt-1">تُعتمد من قبل {blocksCount} مهام</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
