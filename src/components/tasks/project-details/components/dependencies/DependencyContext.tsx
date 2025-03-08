import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useTaskDependencies } from "../../hooks/useTaskDependencies";
import { Task } from "../../types/task";
import { DependencyType } from "../../types/dependency";
import { toast } from "sonner";
import { fetchAvailableTasks } from "../../hooks/useTaskDependencies.service";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

interface DependencyContextType {
  dependencies: Task[];
  dependentTasks: Task[];
  availableTasks: Task[];
  selectedTaskId: string;
  dependencyType: DependencyType;
  isAdding: boolean;
  isLoadingTasks: boolean;
  isDependenciesLoading: boolean;
  canManageDependencies: boolean;
  setSelectedTaskId: (id: string) => void;
  setDependencyType: (type: DependencyType) => void;
  addDependency: () => Promise<void>;
  removeDependency: (dependencyId: string) => Promise<void>;
  getStatusBadge: (status: string) => JSX.Element;
}

const DependencyContext = createContext<DependencyContextType | undefined>(undefined);

export const useDependencyContext = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error("useDependencyContext must be used within a DependencyProvider");
  }
  return context;
};

interface DependencyProviderProps {
  children: ReactNode;
  taskId: string;
  projectId: string;
}

export const DependencyProvider = ({ children, taskId, projectId }: DependencyProviderProps) => {
  const { 
    dependencies, 
    dependentTasks, 
    addDependency: addTaskDependency, 
    removeDependency: removeTaskDependency,
    fetchDependencies,
    isLoading: isDependenciesLoading 
  } = useTaskDependencies(taskId);
  
  const { user } = useAuthStore();
  const [canManageDependencies, setCanManageDependencies] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [dependencyType, setDependencyType] = useState<DependencyType>("finish-to-start");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
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
      if (projectId) {
        try {
          const { data: projectData, error } = await supabase
            .from('project_tasks')
            .select('project_manager')
            .eq('id', projectId)
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
  }, [user, projectId]);
  
  useEffect(() => {
    if (taskId) {
      loadAvailableTasks();
    }
  }, [taskId, dependencies]);
  
  const loadAvailableTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const tasksData = await fetchAvailableTasks(projectId, taskId, dependencies);
      setAvailableTasks(tasksData);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
      toast.error("حدث خطأ أثناء جلب المهام المتاحة");
    } finally {
      setIsLoadingTasks(false);
    }
  };
  
  const addDependency = async () => {
    if (!selectedTaskId) {
      toast.error("الرجاء اختيار مهمة");
      return;
    }
    
    if (!canManageDependencies) {
      toast.error("ليس لديك صلاحية لإدارة اعتماديات المهام");
      return;
    }
    
    setIsAdding(true);
    try {
      const result = await addTaskDependency(selectedTaskId, dependencyType);
      
      if (result === true) {
        setSelectedTaskId("");
        // Refresh dependencies and available tasks
        await fetchDependencies();
        await loadAvailableTasks();
      }
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast.error("حدث خطأ أثناء إضافة الاعتمادية");
    } finally {
      setIsAdding(false);
    }
  };
  
  const removeDependency = async (dependencyId: string) => {
    if (!canManageDependencies) {
      toast.error("ليس لديك صلاحية لإدارة اعتماديات المهام");
      return;
    }
    
    try {
      await removeTaskDependency(dependencyId);
      await loadAvailableTasks(); // Refresh the list
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast.error("حدث خطأ أثناء إزالة الاعتمادية");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            مكتمل
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            قيد التنفيذ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            معلق
          </span>
        );
    }
  };
  
  const value = {
    dependencies,
    dependentTasks,
    availableTasks,
    selectedTaskId,
    dependencyType,
    isAdding,
    isLoadingTasks,
    isDependenciesLoading,
    canManageDependencies,
    setSelectedTaskId,
    setDependencyType,
    addDependency,
    removeDependency,
    getStatusBadge
  };
  
  return (
    <DependencyContext.Provider value={value}>
      {children}
    </DependencyContext.Provider>
  );
};

import { Check } from "lucide-react";
