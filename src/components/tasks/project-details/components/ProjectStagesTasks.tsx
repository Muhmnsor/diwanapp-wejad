
import { Task } from "../types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { useState } from "react";
import { TaskDiscussionDialog } from "@/components/tasks/components/TaskDiscussionDialog";

interface ProjectStagesTasksProps {
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
}

export const ProjectStagesTasks = ({
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: ProjectStagesTasksProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleShowDiscussion = (task: Task) => {
    setSelectedTask(task);
    setShowDiscussion(true);
  };

  return (
    <div className="space-y-8">
      {projectStages.map((stage) => {
        const stageTasks = tasksByStage[stage.id] || [];
        
        return (
          <Card key={stage.id} className="border-t-4" style={{ borderTopColor: stage.color || '#cbd5e1' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{stage.name}</span>
                <span className="text-sm text-muted-foreground">{stageTasks.length} مهمة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stageTasks.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">المهمة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الأولوية</TableHead>
                        <TableHead>المكلف</TableHead>
                        <TableHead>تاريخ الاستحقاق</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stageTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>{task.assigned_user_name ?? 'غير مكلف'}</TableCell>
                          <TableCell>{formatDate(task.due_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleShowDiscussion(task)}
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="sr-only">مناقشة</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only">إضافة مهمة فرعية</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">لا توجد مهام في هذه المرحلة</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {selectedTask && (
        <TaskDiscussionDialog 
          open={showDiscussion} 
          onOpenChange={setShowDiscussion}
          task={selectedTask}
        />
      )}
    </div>
  );
};
