
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock,
  AlertCircle,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";

export const PendingTasksList = () => {
  const { user } = useAuthStore();
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project_tasks!project_id(
            projects(
              title
            )
          )
        `)
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include the project title
      const transformedData = data?.map(task => ({
        ...task,
        project_name: task.project_tasks?.projects?.title || 'مشروع غير محدد'
      })) || [];
      
      console.log('Transformed assigned tasks data:', transformedData);
      return transformedData;
    },
    enabled: !!user?.id
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
        <p className="text-gray-500">لا توجد مهام مكلف بها</p>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
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
              {getStatusIcon(task.status)}
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
