// src/components/tasks/project-details/ProjectTasksList.tsx
import React from "react";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "./types/task";

export function ProjectTasksList() {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const projectId = window.location.pathname.split("/").pop();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    isError,
  } = useTasks({ projectId: projectId || "" });

  const projectStages = [
    { id: "stage1", name: "المرحلة الأولى" },
    { id: "stage2", name: "المرحلة الثانية" },
    { id: "stage3", name: "المرحلة الثالثة" },
  ];

  const tasksByStage = tasks?.reduce((acc: Record<string, Task[]>, task) => {
    if (!acc[task.stage_id]) {
      acc[task.stage_id] = [];
    }
    acc[task.stage_id].push(task);
    return acc;
  }, {}) || {};

  const filteredTasks = tasks?.filter((task) => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  }) || [];

  const handleAddTask = () => {
    setIsAddTaskOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const getStatusBadge = (status: string) => {
    let text, variant;
    switch (status) {
      case "pending":
        text = "قيد الانتظار";
        variant = "outline";
        break;
      case "in_progress":
        text = "قيد التنفيذ";
        variant = "secondary";
        break;
      case "completed":
        text = "مكتملة";
        variant = "default";
        break;
      case "delayed":
        text = "متأخرة";
        variant = "destructive";
        break;
      default:
        text = "غير معروف";
        variant = "default";
        break;
    }
    return <Badge variant={variant}>{text}</Badge>;
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;

    let text, variant;
    switch (priority) {
      case "low":
        text = "منخفضة";
        variant = "outline";
        break;
      case "medium":
        text = "متوسطة";
        variant = "secondary";
        break;
      case "high":
        text = "عالية";
        variant = "destructive";
        break;
      default:
        return null;
    }
    return <Badge variant={variant}>{text}</Badge>;
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId)
      .select();

    if (error) {
      console.error("Error updating task status:", error);
      throw error;
    }

    return data;
  };

  const mutation = useMutation(
    (variables: { taskId: string; newStatus: string }) =>
      updateTaskStatus(variables.taskId, variables.newStatus),
    {
      onSuccess: () => {
        toast({
          title: "تم تحديث حالة المهمة بنجاح",
        });
        // Update the invalidateQueries call to use the new syntax
        queryClient.invalidateQueries({
          queryKey: ['project-tasks', projectId]
        });
      },
      onError: () => {
        toast({
          title: "فشل في تحديث حالة المهمة",
          variant: "destructive",
        });
      },
    }
  );

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    mutation.mutate({ taskId, newStatus });
  };

  if (isError) {
    return <p>Error fetching tasks.</p>;
  }

  return (
    <div className="space-y-4">
      <TasksHeader onAddTask={handleAddTask} />
      <TasksFilter activeTab={activeTab} onTabChange={handleTabChange} />
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
      />
    </div>
  );
}
