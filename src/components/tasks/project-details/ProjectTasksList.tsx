import React, { useState } from "react";
import { ProjectTask } from "@/types/task";
import { ProjectTaskItem } from "./ProjectTaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTaskForm } from "./AddTaskForm";
import { useProjectTasks } from "@/hooks/tasks/useProjectTasks";
import { TaskSkeleton } from "../TaskSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDeleteTask } from "@/hooks/tasks/useDeleteTask";
import { toast } from "sonner";
import { useUpdateTask } from "@/hooks/tasks/useUpdateTask";
import { useCreateTask } from "@/hooks/tasks/useCreateTask";

interface ProjectTasksListProps {
  projectId: string;
}

export const ProjectTasksList: React.FC<ProjectTasksListProps> = ({ projectId }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { data: tasks, isLoading, refetch } = useProjectTasks(projectId);
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: createTask } = useCreateTask();

  const handleAddTask = async (taskData: Partial<ProjectTask>) => {
    createTask(
      {
        ...taskData,
        project_id: projectId,
      },
      {
        onSuccess: () => {
          toast.success("تمت إضافة المهمة بنجاح");
          setIsAddingTask(false);
          refetch();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء إضافة المهمة");
          console.error(error);
        },
      }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("تم حذف المهمة بنجاح");
        refetch();
      },
      onError: (error) => {
        toast.error("حدث خطأ أثناء حذف المهمة");
        console.error(error);
      },
    });
  };

  const handleUpdateTask = (taskId: string, taskData: Partial<ProjectTask>) => {
    updateTask(
      { id: taskId, ...taskData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المهمة بنجاح");
          refetch();
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث المهمة");
          console.error(error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {tasks && tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <ProjectTaskItem
              key={task.id}
              task={task}
              onDelete={() => handleDeleteTask(task.id)}
              onUpdate={(data) => handleUpdateTask(task.id, data)}
              isGeneral={task.category === "general" ? true : false}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد مهام"
          description="لم يتم إضافة أي مهام لهذا المشروع بعد"
          icon="task"
        />
      )}

      {isAddingTask ? (
        <AddTaskForm
          onSubmit={handleAddTask}
          onCancel={() => setIsAddingTask(false)}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة جديدة
        </Button>
      )}
    </div>
  );
};
