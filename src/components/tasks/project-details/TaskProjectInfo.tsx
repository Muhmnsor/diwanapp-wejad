
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  AlertTriangle,
  Clock as ClockIcon
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  created_at?: string;
}

interface TaskProjectInfoProps {
  project: TaskProject;
}

export const TaskProjectInfo = ({ project }: TaskProjectInfoProps) => {
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        // Fetch tasks for this project
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        // Calculate metrics
        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        // Calculate overdue tasks (tasks with due_date in the past and not completed)
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [project.id]);

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
        return <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500"><ClockIcon className="h-3 w-3" /> متوقف</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    }
  };

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };
  
  const getTimeToDeadline = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      return null;
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

  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;
  const remainingDays = getRemainingDays(project.due_date);
  const timeToDeadline = getTimeToDeadline(project.due_date);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700 whitespace-pre-line">
            {project.description || 'لا يوجد وصف لهذا المشروع'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-md">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
            <CalendarIcon className="h-4 w-4 text-blue-700" />
            <span className="text-sm font-medium text-blue-900">
              {project.created_at ? getFormattedDate(project.created_at) : 'غير محدد'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-md">
            <CalendarIcon className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-900">
              {getFormattedDate(project.due_date)}
            </span>
          </div>
          
          {timeToDeadline && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
              <ClockIcon className="h-4 w-4 text-green-700" />
              <span className="text-sm font-medium text-green-900">
                {timeToDeadline}
              </span>
            </div>
          )}
          
          {remainingDays !== null && (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-md">
              <ClockIcon className="h-4 w-4 text-purple-700" />
              <span className="text-sm font-medium text-purple-900">
                متبقي {remainingDays} يوم
              </span>
            </div>
          )}
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-3">تقدم المشروع</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">نسبة الإنجاز</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{completedTasksCount} مهام منجزة</span>
              </div>
              <div className="flex items-center gap-1 text-sm bg-amber-50 px-2 py-1 rounded">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>{overdueTasksCount} مهام متأخرة</span>
              </div>
              {totalTasksCount > 0 && (
                <div className="flex items-center gap-1 text-sm bg-blue-50 px-2 py-1 rounded">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  <span>{totalTasksCount} إجمالي المهام</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
