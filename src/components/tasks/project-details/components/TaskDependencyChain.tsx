
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDown, Check, Clock, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface TaskNode {
  task: Task;
  dependencies: TaskNode[];
  dependencyType: string;
}

interface TaskDependencyChainProps {
  taskId: string;
  maxDepth?: number;
}

export const TaskDependencyChain = ({ taskId, maxDepth = 3 }: TaskDependencyChainProps) => {
  const [rootTask, setRootTask] = useState<Task | null>(null);
  const [dependencyChain, setDependencyChain] = useState<TaskNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDependencyChain = async () => {
      if (!taskId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the root task
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('id, title, status')
          .eq('id', taskId)
          .single();
          
        if (taskError) throw taskError;
        setRootTask(taskData);
        
        // Build the dependency chain
        const chain = await buildDependencyChain(taskId, maxDepth);
        setDependencyChain(chain);
      } catch (err) {
        console.error("Error fetching dependency chain:", err);
        setError("Failed to load dependency chain");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependencyChain();
  }, [taskId, maxDepth]);
  
  // Recursively build the dependency tree
  const buildDependencyChain = async (
    currentTaskId: string, 
    depth: number,
    visitedTasks: Set<string> = new Set()
  ): Promise<TaskNode | null> => {
    if (depth <= 0 || visitedTasks.has(currentTaskId)) return null;
    
    try {
      // Add current task to visited set to prevent cycles
      visitedTasks.add(currentTaskId);
      
      // Get task details
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('id', currentTaskId)
        .single();
        
      if (taskError) throw taskError;
      
      // Get dependencies for this task
      const { data: dependenciesData, error: depsError } = await supabase
        .from('task_dependencies')
        .select(`
          dependency_task_id,
          dependency_type
        `)
        .eq('task_id', currentTaskId);
        
      if (depsError) throw depsError;
      
      // Create the node for this task
      const node: TaskNode = {
        task: taskData,
        dependencies: [],
        dependencyType: 'root' // Root task has no dependency type
      };
      
      // For each dependency, recursively build its chain
      for (const dep of dependenciesData || []) {
        const childNode = await buildDependencyChain(
          dep.dependency_task_id, 
          depth - 1,
          new Set(visitedTasks) // Create a new copy of visited tasks for each branch
        );
        
        if (childNode) {
          childNode.dependencyType = dep.dependency_type;
          node.dependencies.push(childNode);
        }
      }
      
      return node;
    } catch (err) {
      console.error("Error building dependency chain:", err);
      return null;
    }
  };
  
  const renderDependencyChain = (node: TaskNode | null, level = 0, isLast = true) => {
    if (!node) return null;
    
    // Determine status indicator
    let statusIcon = <Clock className="h-4 w-4 text-orange-500" />; // default for in progress
    if (node.task.status === 'completed') {
      statusIcon = <Check className="h-4 w-4 text-green-500" />;
    } else if (node.task.status === 'pending') {
      statusIcon = <AlertCircle className="h-4 w-4 text-gray-500" />;
    } else if (node.task.status === 'delayed') {
      statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    // Determine dependency type badge
    let dependencyBadge = null;
    if (node.dependencyType !== 'root') {
      let badgeVariant: "default" | "secondary" | "outline" = "outline";
      let badgeLabel = "";
      
      switch (node.dependencyType) {
        case 'blocked_by':
          badgeVariant = "secondary";
          badgeLabel = "تعتمد على";
          break;
        case 'finish-to-start':
          badgeVariant = "default";
          badgeLabel = "لا تبدأ حتى تنتهي";
          break;
        case 'start-to-start':
          badgeVariant = "secondary";
          badgeLabel = "تبدأ مع بداية";
          break;
        case 'finish-to-finish':
          badgeVariant = "default";
          badgeLabel = "تنتهي مع نهاية";
          break;
        default:
          badgeLabel = node.dependencyType;
      }
      
      dependencyBadge = (
        <Badge variant={badgeVariant} className="ml-2">
          {badgeLabel}
        </Badge>
      );
    }
    
    return (
      <div className="relative" style={{ marginLeft: `${level * 24}px` }}>
        {level > 0 && (
          <div 
            className="absolute border-l-2 border-gray-300" 
            style={{ 
              left: '-12px', 
              top: '-10px', 
              height: '30px',
              borderLeftStyle: isLast ? 'solid' : 'dashed'
            }}
          />
        )}
        
        <div className="flex items-center mb-1">
          {level > 0 && (
            <ArrowRight className="h-4 w-4 text-gray-400 mr-2" />
          )}
          
          <Card className="w-full max-w-xs border-l-4" style={{
            borderLeftColor: node.task.status === 'completed' 
              ? 'rgb(34, 197, 94)' // green-500
              : node.task.status === 'in_progress'
                ? 'rgb(249, 115, 22)' // orange-500
                : node.task.status === 'delayed'
                  ? 'rgb(239, 68, 68)' // red-500
                  : 'rgb(156, 163, 175)' // gray-400
          }}>
            <CardHeader className="p-3">
              <div className="flex justify-between">
                <CardTitle className="text-sm">{node.task.title}</CardTitle>
                {statusIcon}
              </div>
              {dependencyBadge && (
                <CardDescription className="mt-1">
                  {dependencyBadge}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        </div>
        
        {node.dependencies.length > 0 && (
          <div className="pt-1 pr-2">
            {node.dependencies.map((childNode, index) => (
              <div key={childNode.task.id}>
                {renderDependencyChain(
                  childNode, 
                  level + 1, 
                  index === node.dependencies.length - 1
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">جاري تحميل سلسلة الاعتماديات...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">شجرة الاعتماديات</h3>
      {dependencyChain ? (
        renderDependencyChain(dependencyChain)
      ) : (
        <div className="text-center text-gray-500">
          لا توجد اعتماديات لهذه المهمة
        </div>
      )}
    </div>
  );
};
