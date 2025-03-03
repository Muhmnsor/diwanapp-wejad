import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  CalendarIcon,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertTriangle,
  CheckSquare 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
}

interface TaskProjectCardProps {
  project: TaskProject;
}

export const TaskProjectCard = ({ project }: TaskProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tasks/project/${project.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> مكتمل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد التنفيذ</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> متعثر</Badge>;
      case 'stopped':
        return <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500"><Clock className="h-3 w-3" /> متوقف</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    }
  };

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  const getRemainingDays = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      const days = differenceInDays(dueDate, today);
      return days <= 0 ? 0 : days;
    } catch (error) {
      return null;
    }
  };

  const completedTasksCount = 3;
  const totalTasksCount = 8;
  const overdueTasksCount = 2;
  const remainingDays = getRemainingDays(project.due_date);
  const completionPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg">{project.title}</h3>
          {getStatusBadge(project.status)}
        </div>
        
        <p className="text-gray-500 mb-4 text-sm line-clamp-2">
          {project.description || 'لا يوجد وصف'}
        </p>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">نسبة الإنجاز</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span>{completedTasksCount} مهام منجزة</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{overdueTasksCount} مهام متأخرة</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t flex justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {project.due_date 
              ? getFormattedDate(project.due_date) 
              : 'غير محدد'}
          </span>
        </div>
        {remainingDays !== null && (
          <div className="text-sm font-medium">
            متبقي {remainingDays} يوم
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
