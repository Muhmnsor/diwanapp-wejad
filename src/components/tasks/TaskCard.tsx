import { format } from "date-fns";
import { Calendar, CheckCircle2, Circle, Clock, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAsanaApi } from "@/hooks/useAsanaApi";
import { toast } from "sonner";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    asana_gid: string | null;
    projects: {
      title: string;
    } | null;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const { updateTask } = useAsanaApi();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (task.asana_gid) {
      try {
        await updateTask(task.asana_gid, newStatus);
        toast.success("تم تحديث حالة المهمة في Asana");
      } catch (error) {
        console.error('Error updating task in Asana:', error);
        toast.error("حدث خطأ في تحديث حالة المهمة في Asana");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        <div className="flex items-center gap-2">
          {task.asana_gid && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <RefreshCw className="h-3 w-3 mr-1" />
              Asana
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className={getStatusColor(task.status)}
            onClick={() => handleStatusUpdate(task.status === 'completed' ? 'pending' : 'completed')}
          >
            <span className="flex items-center gap-1">
              {getStatusIcon(task.status)}
              {task.status === 'completed' ? 'مكتمل' : 
               task.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-gray-600 mb-4">{task.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task.projects?.title && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {task.projects.title}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(task.due_date), 'dd/MM/yyyy')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};