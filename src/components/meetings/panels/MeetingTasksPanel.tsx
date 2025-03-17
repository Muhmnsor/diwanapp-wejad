
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingTask } from "@/components/meetings/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, ListTodo, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MeetingTasksPanelProps {
  tasks: MeetingTask[];
  onSelectTask?: (task: MeetingTask) => void;
  onAddTask?: (task: Omit<MeetingTask, "id" | "created_at" | "updated_at">) => void;
  onUpdateTask?: (id: string, updates: Partial<MeetingTask>) => void;
}

export const MeetingTasksPanel: React.FC<MeetingTasksPanelProps> = ({ 
  tasks,
  onSelectTask,
  onAddTask,
  onUpdateTask
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListTodo className="ml-2 h-5 w-5 text-primary" />
            مهام الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مهام مسجلة للاجتماع
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTaskTypeBadge = (type: string) => {
    switch(type) {
      case 'preparation':
        return <Badge variant="outline">تحضير</Badge>;
      case 'execution':
        return <Badge variant="outline">تنفيذ</Badge>;
      case 'follow_up':
        return <Badge variant="outline">متابعة</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ListTodo className="ml-2 h-5 w-5 text-primary" />
          مهام الاجتماع ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li 
                key={task.id} 
                className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectTask?.(task)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div>
                    {getStatusIcon(task.status)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {getTaskTypeBadge(task.task_type)}
                  
                  {task.assigned_to && task.assignee && (
                    <div className="flex items-center ml-3">
                      <User className="h-3 w-3 ml-1 inline" />
                      {task.assignee.display_name || 'غير محدد'}
                    </div>
                  )}
                  
                  {task.due_date && (
                    <div className="flex items-center ml-3">
                      <Calendar className="h-3 w-3 ml-1 inline" />
                      {new Date(task.due_date).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
