
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

  // هذه بيانات وهمية، ستحتاج لاستبدالها بالبيانات الفعلية من قاعدة البيانات
  const completedTasksCount = 3;
  const totalTasksCount = 8;
  const overdueTasksCount = 2;
  const completionPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-700 mb-1">تاريخ الإنشاء</h3>
            <p className="text-blue-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {project.created_at ? getFormattedDate(project.created_at) : 'غير محدد'}
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-amber-700 mb-1">تاريخ الانتهاء</h3>
            <p className="text-amber-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {getFormattedDate(project.due_date)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-green-700 mb-1">الوقت المتبقي</h3>
            <p className="text-green-900 flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              {timeToDeadline || 'غير محدد'}
            </p>
          </div>
        </div>
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-3">تقدم المشروع</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">نسبة الإنجاز</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{completedTasksCount} مهام منجزة</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>{overdueTasksCount} مهام متأخرة</span>
              </div>
              {remainingDays !== null && (
                <div className="flex items-center gap-1 text-sm">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  <span>متبقي {remainingDays} يوم</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
