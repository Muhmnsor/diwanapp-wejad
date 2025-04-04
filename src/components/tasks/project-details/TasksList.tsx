// src/components/tasks/project-details/TasksList.tsx
import React, { useState, useEffect } from "react";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { Task } from "./types/task";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskStatus } from "@/lib/api/tasks";
import { TaskForm } from "./components/TaskForm";
import { ProjectMember } from "./types/projectMember";

interface TasksListProps {
  projectId?: string;
  isGeneral?: boolean;
  projectStages?: { id: string; name: string }[];
  projectMembers?: ProjectMember[];
}

export function TasksList({ projectId, isGeneral, projectStages = [], projectMembers = [] }: TasksListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [attachment, setAttachment] = useState<File[] | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedTasks, isLoading, refetch } = useTasks(projectId, isGeneral);

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const filteredTasks = tasks.filter(task =>
    activeTab === "all" || task.status === activeTab
  );

  const tasksByStage = projectStages.reduce((acc, stage) => {
    acc[stage.id] = filteredTasks.filter(task => task.stage_id === stage.id);
    return acc;
  }, {});

  const handleAddTask = () => {
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditing(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Implement delete logic here
    console.log(`Deleting task with ID: ${taskId}`);
  };

  const handleCloseTaskForm = () => {
    setIsAddTaskOpen(false);
    setEditingTask(null);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    let color = "neutral";
    if (status === "completed") color = "green";
    if (status === "in_progress") color = "blue";
    if (status === "delayed") color = "red";
    if (status === "pending") color = "neutral";

    return <Badge variant={color}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;

    let color = "neutral";
    if (priority === "high") color = "red";
    if (priority === "medium") color = "yellow";
    if (priority === "low") color = "green";

    return <Badge variant={color}>{priority}</Badge>;
  };

  const { mutate: updateStatus, isLoading: isUpdating } = useMutation(
    ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    {
      onSuccess: () => {
        toast({
          title: "تم تحديث حالة المهمة",
        });
        refetch();
      },
      onError: () => {
        toast({
          title: "فشل تحديث حالة المهمة",
          variant: "destructive",
        });
      },
    }
  );

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    updateStatus({ id: taskId, status: newStatus });
    queryClient.invalidateQueries({
      queryKey: ['tasks']
    });
  };

  const handleSubmitTask = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    attachment?: File[] | null;
    category: string;
  }) => {
    // Implement submit logic here
    console.log("Submitting task:", formData);
    setIsAddTaskOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <TasksHeader
        onAddTask={handleAddTask}
        isGeneral={isGeneral}
      />

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

      {isAddTaskOpen && (
        <TaskForm
          onSubmit={handleSubmitTask}
          isSubmitting={false}
          projectStages={projectStages}
          projectMembers={projectMembers}
        />
      )}

      {isEditing && editingTask && (
        <TaskForm
          onSubmit={handleSubmitTask}
          isSubmitting={false}
          projectStages={projectStages}
          projectMembers={projectMembers}
          attachment={attachment}
          setAttachment={setAttachment}
        />
      )}
    </div>
  );
}
