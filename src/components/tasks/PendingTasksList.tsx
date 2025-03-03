
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const PendingTasksList = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project_tasks (
            id,
            project_id,
            projects:project_id (
              title
            )
          )
        `)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      
      // Transform the data to include the project title
      const transformedData = data?.map(task => ({
        ...task,
        project_name: task.project_tasks?.[0]?.projects?.title || 'مشروع غير محدد'
      })) || [];
      
      console.log('Transformed task data:', transformedData);
      return transformedData;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">لا توجد مهام قيد التنفيذ</p>
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
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">{task.title}</h3>
            </div>
            {getPriorityBadge(task.priority)}
          </div>
          <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
            <span>{task.project_name || 'مشروع غير محدد'}</span>
            <span>{formatDueDate(task.due_date)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
