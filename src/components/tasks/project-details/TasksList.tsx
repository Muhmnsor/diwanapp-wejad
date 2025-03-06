import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "./ProjectStages";
import { AddTaskDialog } from "./AddTaskDialog";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { useTasksList } from "./hooks/useTasksList";
import { Task } from "./types/task";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TasksListProps {
  projectId?: string | undefined;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ projectId }: TasksListProps) => {
  const {
    tasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  } = useTasksList(projectId);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fetch project members
  const { projectMembers } = useProjectMembers(projectId);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  return (
    <>
      {!isGeneral && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader onAddTask={() => setIsAddDialogOpen(true)} isGeneral={isGeneral} />
        </CardHeader>
        
        <CardContent className="pt-4">
          <TasksFilter 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <TasksContent 
            isLoading={isLoading}
            activeTab={activeTab}
            filteredTasks={filteredTasks}
            projectStages={projectStages}
            tasksByStage={tasksByStage}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={handleStatusChange}
            projectId={projectId}
            isGeneral={isGeneral}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId || ""}
        projectStages={projectStages}
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
        isGeneral={isGeneral}
      />

      {/* حوار تعديل المهمة */}
      {editingTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تعديل المهمة</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {/* هنا يتم وضع نموذج تعديل المهمة - استخدم DialogContent الموجود بالفعل */}
              <p className="text-center text-gray-500">
                سيتم تنفيذ نموذج تعديل المهمة هنا في التحديثات القادمة
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* حوار تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد حذف المهمة</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-right">
            <p className="mb-4">
              هل أنت متأكد أنك تريد حذف هذه المهمة؟ سيتم حذف جميع البيانات المرتبطة بها بما في ذلك المهام الفرعية والمرفقات والتعليقات.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={confirmDeleteTask}>
                تأكيد الحذف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
