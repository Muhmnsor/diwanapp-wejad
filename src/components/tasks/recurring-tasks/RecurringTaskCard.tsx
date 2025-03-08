
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/tasks/project-details/utils/taskFormatters";
import { Pencil, Trash2, Play, Pause } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  is_active: boolean;
  day_of_month: number | null;
  project_id: string | null;
  workspace_id: string | null;
  priority: string;
  category: string | null;
  created_by: string;
  created_at: string;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
}

interface RecurringTaskCardProps {
  task: RecurringTask;
  onEdit: () => void;
  onRefresh: () => void;
}

export const RecurringTaskCard = ({ task, onEdit, onRefresh }: RecurringTaskCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success('تم حذف المهمة المتكررة بنجاح');
      onRefresh();
    } catch (error) {
      console.error('Error deleting recurring task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة المتكررة');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActivation = async () => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .update({ is_active: !task.is_active })
        .eq('id', task.id);

      if (error) throw error;

      toast.success(task.is_active ? 'تم إيقاف المهمة المتكررة' : 'تم تنشيط المهمة المتكررة');
      onRefresh();
    } catch (error) {
      console.error('Error updating recurring task status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة المتكررة');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getRecurrenceText = () => {
    if (task.recurrence_type === 'monthly' && task.day_of_month) {
      return `شهرياً في اليوم ${task.day_of_month}`;
    } else if (task.recurrence_type === 'weekly') {
      return `أسبوعياً`;
    } else if (task.recurrence_type === 'daily') {
      return `يومياً`;
    }
    return `كل ${task.interval} ${task.recurrence_type === 'monthly' ? 'شهر' : task.recurrence_type === 'weekly' ? 'أسبوع' : 'يوم'}`;
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="destructive">عالية</Badge>;
      case 'medium':
        return <Badge variant="default">متوسطة</Badge>;
      case 'low':
        return <Badge variant="outline">منخفضة</Badge>;
      default:
        return <Badge variant="secondary">متوسطة</Badge>;
    }
  };

  const getStatusBadge = () => {
    return task.is_active ? (
      <Badge variant="success" className="bg-green-500">نشطة</Badge>
    ) : (
      <Badge variant="secondary">غير نشطة</Badge>
    );
  };

  return (
    <Card className={`border-l-4 ${
      task.is_active ? 'border-l-green-500' : 'border-l-gray-300'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">التكرار:</span>
            <span className="font-medium">{getRecurrenceText()}</span>
          </div>
          
          {task.category && (
            <div className="flex justify-between">
              <span className="text-gray-500">الفئة:</span>
              <span>{task.category}</span>
            </div>
          )}
          
          {task.next_generation_date && (
            <div className="flex justify-between">
              <span className="text-gray-500">الإنشاء التالي:</span>
              <span className="font-medium">{formatDate(task.next_generation_date)}</span>
            </div>
          )}
          
          {task.last_generated_date && (
            <div className="flex justify-between">
              <span className="text-gray-500">آخر إنشاء:</span>
              <span>{formatDate(task.last_generated_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleActivation}
          disabled={isUpdatingStatus}
        >
          {task.is_active ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              إيقاف
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              تنشيط
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            تعديل
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف المهمة المتكررة؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيؤدي هذا إلى حذف قالب المهمة المتكررة نهائياً. لن يتم إنشاء مهام جديدة، لكن المهام السابقة لن تتأثر.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف نهائياً'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};
