import { GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityBadge } from "../priority/TaskPriorityBadge";
import { TaskStatusBadge } from "../status/TaskStatusBadge";
import { Task } from "../../types/task";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DependencyIcon } from "../dependencies/DependencyIcon";

interface TaskHeaderProps {
  task: Task;
  status: string;
  onShowDependencies?: () => void;
  hasDependencies?: boolean;
  dependencyIconColor?: string;
}

export const TaskHeader = ({ 
  task, 
  status, 
  onShowDependencies,
  hasDependencies = false,
  dependencyIconColor = 'text-gray-500'
}: TaskHeaderProps) => {
  const { user } = useAuthStore();
  const [canManageDependencies, setCanManageDependencies] = useState(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanManageDependencies(false);
        return;
      }
      
      // Check if user is admin or has admin role
      if (user.isAdmin) {
        setCanManageDependencies(true);
        return;
      }
      
      // Check if user is the project manager (for project tasks)
      if (task.project_id) {
        try {
          const { data: projectData, error } = await supabase
            .from('project_tasks')
            .select('project_manager')
            .eq('id', task.project_id)
            .single();
          
          if (!error && projectData && projectData.project_manager === user.id) {
            setCanManageDependencies(true);
            return;
          }
        } catch (error) {
          console.error("Error checking project manager:", error);
        }
      }
      
      // Check if user has specific dependency management permission
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id)
          .single();
          
        if (roleError || !roleData) {
          setCanManageDependencies(false);
          return;
        }
        
        const { data: permissionsData, error: permError } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', roleData.role_id);
          
        if (permError || !permissionsData) {
          setCanManageDependencies(false);
          return;
        }
        
        const permissionIds = permissionsData.map(p => p.permission_id);
        
        // Check for dependency management permission
        const { data: dependencyPermission, error: dpError } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', 'manage_task_dependencies')
          .in('id', permissionIds);
          
        setCanManageDependencies(dependencyPermission && dependencyPermission.length > 0);
      } catch (error) {
        console.error("Error checking permissions:", error);
        setCanManageDependencies(false);
      }
    };
    
    checkPermissions();
  }, [user, task.project_id]);
  
  const hasPendingDependencies = dependencyIconColor === 'text-amber-500';
  const hasDependents = dependencyIconColor === 'text-blue-500' && !hasPendingDependencies;
  
  return (
    <div className="flex justify-between items-start w-full">
      <div className="max-w-[70%]">
        {task.is_subtask && (
          <div className="flex items-center gap-1 mb-1">
            <GitMerge className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs bg-blue-50">مهمة فرعية</Badge>
          </div>
        )}
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          {onShowDependencies && canManageDependencies && (
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-6 w-6 ${hasDependencies || hasDependents ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
              onClick={onShowDependencies}
              title="إدارة اعتماديات المهمة"
            >
              <DependencyIcon 
                hasDependencies={hasDependencies} 
                hasPendingDependencies={hasPendingDependencies}
                hasDependents={hasDependents}
                size={16}
              />
            </Button>
          )}
        </div>
        {task.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 mr-auto ml-4">
        <TaskStatusBadge status={status} dueDate={task.due_date} />
        <TaskPriorityBadge priority={task.priority} />
      </div>
    </div>
  );
};
