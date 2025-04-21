import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PendingTasksList = () => {
  const { tasks, loading, error, refetch } = useAssignedTasks();

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>حدث خطأ أثناء جلب المهام: {error.message}</p>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={refetch}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Filter for pending/in-progress tasks
  const pendingTasks = tasks.filter(
    (task) => task.status === "pending" || task.status === "in-progress"
  );

  if (!pendingTasks || pendingTasks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">لا توجد مهام معلقة أو جارية</p>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">عالية</Badge>;
      case 'medium':
        return <Badge variant="default">متوسطة</Badge>;
      case 'low':
        return <Badge variant="outline">منخفضة</Badge>;
      default:
        return null;
    }
  };

  const formatDueDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: ar });
    } catch {
      return 'تاريخ غير صالح';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'portfolio':
        return 'محفظة';
      case 'regular':
        return 'عادي';
      case 'subtask':
        return 'فرعي';
      default:
        return 'مصدر غير معروف';
    }
  };

  return (
    <div className="space-y-3">
      {pendingTasks.map((task) => (
        <TooltipProvider key={task.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {task.project_name || 'مشروع غير محدد'} • {getSourceLabel(task.source)}
                  </span>
                  <span>{task.due_date ? formatDueDate(task.due_date) : 'بدون تاريخ'}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.description || 'لا يوجد وصف'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
