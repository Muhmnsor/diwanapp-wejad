
import React from "react";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { TasksContent } from "./components/TasksContent";
import { TasksFilter } from "./components/TasksFilter";
import { Badge } from "@/components/ui/badge"; 
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectTasksListProps {
  projectId: string;
}

export const ProjectTasksList: React.FC<ProjectTasksListProps> = ({ projectId }) => {
  const {
    isLoading,
    error,
    tasks,
    activeTab,
    setActiveTab,
    stages,
    tasksByStage,
    getStatusBadge,
    getPriorityBadge,
    handleStatusChange,
    openEditDialog,
    openDeleteDialog
  } = useProjectTasks(projectId);

  // Format date function
  const formatDate = (date: string | null) => {
    if (!date) return "غير محدد";
    try {
      return format(new Date(date), "d MMMM yyyy", { locale: ar });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200" dir="rtl">
        <h3 className="font-medium mb-2">حدث خطأ أثناء تحميل المهام</h3>
        <p className="text-sm">{error instanceof Error ? error.message : 'خطأ غير معروف'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <TasksFilter 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoading={isLoading} 
      />
      
      {/* Tasks content */}
      <TasksContent 
        isLoading={isLoading}
        activeTab={activeTab}
        filteredTasks={tasks.filter(task => 
          activeTab === "all" || task.status === activeTab
        )}
        projectStages={stages}
        tasksByStage={tasksByStage}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={handleStatusChange}
        projectId={projectId}
        onEditTask={openEditDialog}
        onDeleteTask={openDeleteDialog}
      />
    </div>
  );
};
