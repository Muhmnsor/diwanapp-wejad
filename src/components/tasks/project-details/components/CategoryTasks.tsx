
import { Task } from "../types/task";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody 
} from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import { formatDate as formatDateUtility } from "@/utils/formatters";

interface CategoryTasksProps {
  category: string;
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
  onEditTask?: (task: Task) => void;
  projectId?: string;
  workspaceId?: string;
}

export const CategoryTasks = ({ 
  category, 
  tasks, 
  onStatusChange, 
  onDelete,
  onTaskUpdated,
  onEditTask,
  projectId = '',
  workspaceId = ''
}: CategoryTasksProps) => {
  if (!tasks || tasks.length === 0) return null;

  // Import these functions from the taskFormatters utility
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="flex items-center gap-1 text-green-500 font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span> مكتمل</div>;
      case 'in_progress':
        return <div className="flex items-center gap-1 text-amber-500 font-medium"><span className="w-2 h-2 rounded-full bg-amber-500"></span> قيد التنفيذ</div>;
      case 'pending':
        return <div className="flex items-center gap-1 text-blue-500 font-medium"><span className="w-2 h-2 rounded-full bg-blue-500"></span> قيد الانتظار</div>;
      case 'delayed':
        return <div className="flex items-center gap-1 text-red-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-500"></span> متأخرة</div>;
      default:
        return <div className="flex items-center gap-1 text-gray-500 font-medium"><span className="w-2 h-2 rounded-full bg-gray-500"></span> غير محدد</div>;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'high':
        return <div className="text-red-500">عالية</div>;
      case 'medium':
        return <div className="text-amber-500">متوسطة</div>;
      case 'low':
        return <div className="text-green-500">منخفضة</div>;
      default:
        return null;
    }
  };

  // Updated to use Gregorian format (Miladi)
  const formatDate = (date: string | null) => {
    if (!date) return "غير محدد";
    
    try {
      // Fix: Use formatDateUtility with just one argument
      return formatDateUtility(date);
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-medium">{category}</h3>
      <div className="border rounded-md overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>المهمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>المكلف</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId || task.project_id || ''}
                onEdit={onEditTask}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
