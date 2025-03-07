
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2, Link2Off, AlertCircle, Clock, CheckCircle, ArrowDownCircle, GitMerge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskDependenciesBadgeProps {
  taskId: string;
}

export const TaskDependenciesBadge = ({ taskId }: TaskDependenciesBadgeProps) => {
  const [dependenciesCount, setDependenciesCount] = useState(0);
  const [blockedByCount, setBlockedByCount] = useState(0);
  const [blocksCount, setBlocksCount] = useState(0);
  const [relatesCount, setRelatesCount] = useState(0);
  const [finishToStartCount, setFinishToStartCount] = useState(0);
  const [startToStartCount, setStartToStartCount] = useState(0);
  const [finishToFinishCount, setFinishToFinishCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const fetchDependenciesCount = async () => {
      try {
        // Get blocking dependencies count (tasks that this task blocks)
        const { count: blocksCount, error: blocksError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('dependency_task_id', taskId)
          .in('dependency_type', ['blocks', 'finish-to-start']);
          
        // Get blocked by dependencies count (tasks that block this task)
        const { count: blockedByCount, error: blockedByError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId)
          .in('dependency_type', ['blocked_by', 'finish-to-start', 'start-to-start']);

        // Get relates to dependencies count
        const { count: relatesCount, error: relatesError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId)
          .eq('dependency_type', 'relates_to');
          
        // Get finish-to-start dependencies count
        const { count: finishToStartCount, error: finishToStartError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId)
          .eq('dependency_type', 'finish-to-start');
          
        // Get start-to-start dependencies count
        const { count: startToStartCount, error: startToStartError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId)
          .eq('dependency_type', 'start-to-start');
          
        // Get finish-to-finish dependencies count
        const { count: finishToFinishCount, error: finishToFinishError } = await supabase
          .from('task_dependencies')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId)
          .eq('dependency_type', 'finish-to-finish');
          
        if (blocksError || blockedByError || relatesError || 
            finishToStartError || startToStartError || finishToFinishError) 
          throw blocksError || blockedByError || relatesError || 
                finishToStartError || startToStartError || finishToFinishError;
        
        setBlocksCount(blocksCount || 0);
        setBlockedByCount(blockedByCount || 0);
        setRelatesCount(relatesCount || 0);
        setFinishToStartCount(finishToStartCount || 0);
        setStartToStartCount(startToStartCount || 0);
        setFinishToFinishCount(finishToFinishCount || 0);
        
        const totalCount = (blocksCount || 0) + (blockedByCount || 0) + 
                           (relatesCount || 0) + (finishToStartCount || 0) +
                           (startToStartCount || 0) + (finishToFinishCount || 0);
                           
        setDependenciesCount(totalCount);
        
        // Check if task is blocked by incomplete tasks
        const { data: blockingTasks, error: blockingError } = await supabase
          .from('task_dependencies')
          .select('dependency_task_id, dependency_type, tasks!inner(status)')
          .eq('task_id', taskId)
          .in('dependency_type', ['blocked_by', 'finish-to-start', 'start-to-start', 'finish-to-finish']);
          
        if (blockingError) throw blockingError;
        
        const isTaskBlocked = blockingTasks && blockingTasks.some(dep => {
          if (dep.dependency_type === 'blocked_by' || dep.dependency_type === 'finish-to-start') {
            return dep.tasks && dep.tasks.status !== 'completed';
          }
          
          if (dep.dependency_type === 'start-to-start') {
            return dep.tasks && dep.tasks.status !== 'in_progress' && dep.tasks.status !== 'completed';
          }
          
          if (dep.dependency_type === 'finish-to-finish') {
            return dep.tasks && dep.tasks.status !== 'completed';
          }
          
          return false;
        });
        
        setIsBlocked(isTaskBlocked);
        
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
  
  let variant: "default" | "destructive" | "outline" | "secondary" = "secondary";
  let icon = <Link2 className="h-3 w-3 mr-1" />;
  let tooltipText = `هذه المهمة لديها ${dependenciesCount} اعتماديات`;
  
  if (isBlocked) {
    variant = "destructive";
    icon = <Link2Off className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة معطلة لأنها تعتمد على مهام لم تكتمل بعد";
  } else if (isComplete && blocksCount > 0) {
    variant = "outline";
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مكتملة ويعتمد عليها مهام أخرى";
  } else if (blocksCount > 0) {
    variant = "secondary";
    icon = <ArrowDownCircle className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مطلوبة لإكمال مهام أخرى";
  } else if (startToStartCount > 0) {
    variant = "secondary";
    icon = <Clock className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مرتبطة ببدء مهام أخرى";
  } else if (finishToFinishCount > 0) {
    variant = "secondary";
    icon = <GitMerge className="h-3 w-3 mr-1" />;
    tooltipText = "هذه المهمة مرتبطة بإنهاء مهام أخرى";
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
            {relatesCount > 0 && <span className="mr-1">•{relatesCount}</span>}
            {startToStartCount > 0 && <span className="mr-1">⟲{startToStartCount}</span>}
            {finishToFinishCount > 0 && <span className="mr-1">⟳{finishToFinishCount}</span>}
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
          {relatesCount > 0 && (
            <p className="text-xs mt-1">مرتبطة بـ {relatesCount} مهام</p>
          )}
          {finishToStartCount > 0 && (
            <p className="text-xs mt-1">لا تبدأ حتى تنتهي {finishToStartCount} مهام</p>
          )}
          {startToStartCount > 0 && (
            <p className="text-xs mt-1">تبدأ مع بداية {startToStartCount} مهام</p>
          )}
          {finishToFinishCount > 0 && (
            <p className="text-xs mt-1">تنتهي مع نهاية {finishToFinishCount} مهام</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
