import { Calendar, ListChecks, User, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    assigned_to: string | null;
    status: string;
    priority: string;
    updated_at: string;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  console.log('📋 Rendering task card with data:', task);

  const { data: assignedUser } = useQuery({
    queryKey: ['profile', task.assigned_to],
    queryFn: async () => {
      if (!task.assigned_to) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', task.assigned_to)
        .single();

      if (error) {
        console.error('Error fetching assigned user:', error);
        return null;
      }

      return data;
    },
    enabled: !!task.assigned_to
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'معلق';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return priority;
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <div>
              <span className="text-sm text-gray-500">اسم المهمة:</span>
              <span className="font-medium mr-1">{task.title}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div>
              <span className="text-sm text-gray-500 ml-1">الحالة:</span>
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-gray-500 ml-1">الأولوية:</span>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>
        </div>

        {task.description && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">الوصف:</span>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-gray-500">تاريخ التنفيذ:</span>
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
            {task.assigned_to && assignedUser && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-gray-500">المسؤول:</span>
                <span>{assignedUser.email}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-gray-500">آخر تحديث:</span>
            <span>{formatDate(task.updated_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};