
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { Task } from "../TasksList";

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
}

export const TaskCard = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate 
}: TaskCardProps) => {
  return (
    <Card className="border hover:border-primary/50 transition-colors">
      <CardContent className="p-4 text-right">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-col gap-2 items-end">
          {task.assigned_user_name && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{task.assigned_user_name}</span>
              <Users className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{formatDate(task.due_date)}</span>
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.stage_name && (
            <Badge variant="outline" className="font-normal text-xs">
              {task.stage_name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
