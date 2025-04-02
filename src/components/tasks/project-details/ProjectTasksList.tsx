import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { ProjectStages } from "./ProjectStages";
import { TasksList } from "./TasksList";

interface ProjectTasksListProps {
  projectId: string;
  canEdit?: boolean;
}

export function ProjectTasksList({ projectId, canEdit }: ProjectTasksListProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [taskFilter, setTaskFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { 
    tasks, 
    categories, 
    isLoading, 
    error,
    refreshTasks 
  } = useProjectTasks(projectId);

  useEffect(() => {
    // Refresh tasks when the component mounts
    refreshTasks();
  }, [projectId]);

  const handleTaskAdded = () => {
    refreshTasks();
  };

  const handleTaskUpdated = () => {
    refreshTasks();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">قائمة المهام</TabsTrigger>
            <TabsTrigger value="board">لوحة المهام</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="ml-2 h-4 w-4" />
            فلترة
          </Button>
          
          {canEdit && (
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مهمة
            </Button>
          )}
        </div>
      </div>
      
      <TabsContent value="list" className="mt-0">
        <Card>
          <CardContent className="p-0">
            <TasksList 
              tasks={tasks} 
              isLoading={isLoading}
              onTaskUpdated={() => refreshTasks()} 
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="board" className="mt-0">
        <ProjectStages 
          projectId={projectId} 
          canEdit={canEdit}
          tasks={tasks}
          isLoading={isLoading}
        />
      </TabsContent>
      
      {isAddDialogOpen && (
        <AddTaskDialog
          projectId={projectId}
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onTaskAdded={() => refreshTasks()}
        />
      )}
    </div>
  );
}
