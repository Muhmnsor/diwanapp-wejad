
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Calendar,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type TaskStatus = 'pending' | 'completed' | 'delayed' | 'upcoming';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  project_name?: string;
  workspace_name?: string;
}

export const AssignedTasksList = () => {
  const { user } = useAuthStore();
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['all-assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching all assigned tasks for user:', user.id);
      
      // Fetch tasks from portfolio_tasks table
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select(`
          id,
          title,
          description,
          status,
          due_date,
          priority,
          project_id,
          workspace_id,
          portfolio_projects(portfolio_only_projects(name)),
          portfolio_workspaces(name)
        `)
        .eq('assigned_to', user.id);
      
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
        throw portfolioError;
      }
      
      // Format the portfolio tasks
      const formattedPortfolioTasks = portfolioTasks?.map(task => {
        // Safely access nested properties
        const projectName = task.portfolio_projects?.portfolio_only_projects?.[0]?.name || 'مشروع غير محدد';
        const workspaceName = task.portfolio_workspaces?.name || 'مساحة غير محددة';
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as TaskStatus,
          due_date: task.due_date,
          priority: task.priority,
          project_name: projectName,
          workspace_name: workspaceName
        };
      }) || [];
      
      // Get tasks from the regular tasks table
      const { data: regularTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id);
      
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      // Format the regular tasks
      const formattedRegularTasks = regularTasks?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        due_date: task.due_date,
        priority: task.priority,
        project_name: task.project_id || 'غير مرتبط بمشروع',
        workspace_name: task.workspace_id || 'غير مرتبط بمساحة'
      })) || [];
      
      // Combine both types of tasks
      const allTasks = [...formattedPortfolioTasks, ...formattedRegularTasks];
      
      console.log('All assigned tasks:', allTasks);
      return allTasks;
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
        return <Badge variant="outline">منخفضة</Badge>;
    }
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return 'غير محدد';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'pending':
        return 'قيد التنفيذ';
      case 'delayed':
        return 'متأخرة';
      case 'upcoming':
        return 'قادمة';
      default:
        return status;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">عنوان المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead>المشروع</TableHead>
            <TableHead>المساحة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-right hover:underline cursor-pointer font-medium">{task.title}</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{task.title}</h3>
                      <p className="text-gray-600 text-sm">{task.description || 'لا يوجد وصف'}</p>
                      <div className="flex items-center mt-2 gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-500">{getStatusText(task.status)}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span>{getStatusText(task.status)}</span>
                </div>
              </TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>{formatDueDate(task.due_date)}</TableCell>
              <TableCell>{task.project_name}</TableCell>
              <TableCell>{task.workspace_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
