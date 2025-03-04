
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const PendingTasksList = () => {
  const { user } = useAuthStore();
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching tasks for user:', user.id);
      
      // تبسيط الاستعلام للحصول على المهام المسندة للمستخدم
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select(`
          *,
          workspace_id,
          project_id
        `)
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching assigned tasks:", error);
        throw error;
      }
      
      // Get workspace and project info for each task
      const enhancedData = await Promise.all(data.map(async (task) => {
        let projectName = 'مشروع غير محدد';
        let workspaceName = 'مساحة عمل غير محددة';
        
        if (task.workspace_id) {
          const { data: workspace } = await supabase
            .from('workspaces')
            .select('name')
            .eq('id', task.workspace_id)
            .single();
          
          if (workspace) {
            workspaceName = workspace.name;
          }
        }
        
        if (task.project_id) {
          const { data: project } = await supabase
            .from('portfolio_only_projects')
            .select('name')
            .eq('id', task.project_id)
            .single();
          
          if (project) {
            projectName = project.name;
          }
        }
        
        return {
          ...task,
          project_name: projectName,
          workspace_name: workspaceName
        };
      }));
      
      console.log('Enhanced tasks data:', enhancedData);
      return enhancedData;
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
  
  if (error) {
    console.error("Error in tasks query:", error);
    return (
      <div className="text-center py-4 text-red-500">
        <p>حدث خطأ أثناء تحميل المهام</p>
        <p className="text-sm">{error.message}</p>
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
        <Popover key={task.id}>
          <PopoverTrigger asChild>
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
                <span>{task.project_name || 'مشروع غير محدد'}</span>
                <span>{task.due_date ? formatDueDate(task.due_date) : 'بدون تاريخ'}</span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-bold text-lg">{task.title}</h4>
              
              <div className="text-sm text-gray-700 border-t pt-2">
                <p className="mb-2">{task.description || 'لا يوجد وصف للمهمة'}</p>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="ml-1 font-medium">المشروع:</span>
                    <span>{task.project_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="ml-1 font-medium">الحالة:</span>
                    <div className="flex items-center">
                      {getStatusIcon(task.status)}
                      <span className="mr-1">
                        {task.status === 'completed' ? 'مكتملة' : 
                         task.status === 'pending' ? 'قيد الانتظار' : 
                         task.status === 'delayed' ? 'متأخرة' : 'قيد التنفيذ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
};
