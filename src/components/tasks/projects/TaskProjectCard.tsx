
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  CalendarIcon,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertTriangle,
  CheckSquare, 
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
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
  created_by?: string | null;
}

interface TaskProjectCardProps {
  project: TaskProject;
}

export const TaskProjectCard = ({ project }: TaskProjectCardProps) => {
  const navigate = useNavigate();
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [projectManager, setProjectManager] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectManagerInfo = async () => {
      if (project.created_by) {
        // استعلام معلومات مدير المشروع من جدول profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', project.created_by)
          .single();
          
        if (error) {
          console.error("Error fetching project manager info:", error);
          return;
        }
        
        if (data) {
          // استخدام اسم العرض إذا كان متاحًا، وإلا استخدام البريد الإلكتروني
          setProjectManager(data.display_name || data.email || "غير معروف");
        }
      }
    };
    
    fetchProjectManagerInfo();
  }, [project.created_by]);

  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        // استعلام المهام لهذا المشروع
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        // حساب المقاييس
        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        // حساب المهام المتأخرة (المهام ذات تاريخ الاستحقاق في الماضي وغير مكتملة)
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);
        
        // حساب نسبة الإكمال
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        setCompletionPercentage(percentage);
        
        // إذا كانت نسبة الإكمال 100٪ ولكن الحالة ليست "مكتملة"، فقم بتحديثها
        if (percentage === 100 && project.status !== 'completed' && total > 0) {
          console.log(`Project ${project.id} is 100% complete, updating status to completed`);
          
          // تحديث حالة المشروع في قاعدة البيانات
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({ status: 'completed' })
            .eq('id', project.id);
            
          if (updateError) {
            console.error("Error updating project status:", updateError);
          }
        }
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [project.id, project.status]);

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

  // هذه الدالة لن نستخدمها بعد الآن
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
        
        {/* بدلاً من عرض الأيام المتبقية، نعرض اسم مدير المشروع */}
        {projectManager && (
          <div className="flex items-center gap-1 text-sm font-medium">
            <User className="h-4 w-4 text-blue-500" />
            <span>{projectManager}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
