
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "../../types/task";
import { TaskCard } from "../TaskCard";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectStagesTabsProps {
  stages: { id: string; name: string }[];
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
}

export const ProjectStagesTabs = ({ 
  stages, 
  tasks, 
  onStatusChange,
  onDeleteTask,
  onEditTask
}: ProjectStagesTabsProps) => {
  // Tasks with no stage assigned
  const unassignedTasks = tasks.filter(task => !task.stage_id);
  
  // Group tasks by stage
  const getStageTasksCount = (stageId: string) => {
    return tasks.filter(task => task.stage_id === stageId).length;
  };
  
  return (
    <Tabs defaultValue="unassigned" className="w-full">
      <TabsList className="mb-6 w-full flex overflow-x-auto space-x-2 pb-1">
        <TabsTrigger value="unassigned" className="px-4 py-2 whitespace-nowrap">
          غير مصنفة ({unassignedTasks.length})
        </TabsTrigger>
        
        {stages.map(stage => (
          <TabsTrigger 
            key={stage.id} 
            value={stage.id} 
            className="px-4 py-2 whitespace-nowrap"
          >
            {stage.name} ({getStageTasksCount(stage.id)})
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="unassigned">
        <Card>
          <CardContent className="p-4">
            {unassignedTasks.length > 0 ? (
              <div className="space-y-4">
                {unassignedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={onStatusChange}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد مهام غير مصنفة
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {stages.map(stage => {
        const stageTasks = tasks.filter(task => task.stage_id === stage.id);
        
        return (
          <TabsContent key={stage.id} value={stage.id}>
            <Card>
              <CardContent className="p-4">
                {stageTasks.length > 0 ? (
                  <div className="space-y-4">
                    {stageTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onStatusChange={onStatusChange}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد مهام في هذه المرحلة
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
