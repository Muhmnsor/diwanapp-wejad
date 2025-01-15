import { Calendar, User, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskMetadataProps {
  dueDate: string | null;
  assignedTo: string | null;
  updatedAt: string;
}

export const TaskMetadata = ({ dueDate, assignedTo, updatedAt }: TaskMetadataProps) => {
  const { data: assignedUser } = useQuery({
    queryKey: ['profile', assignedTo],
    queryFn: async () => {
      if (!assignedTo) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', assignedTo)
        .single();

      if (error) {
        console.error('Error fetching assigned user:', error);
        return null;
      }

      return data;
    },
    enabled: !!assignedTo
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <div className="flex items-center gap-4">
        {dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="text-gray-500">تاريخ التنفيذ:</span>
            <span>{formatDate(dueDate)}</span>
          </div>
        )}
        {assignedTo && assignedUser && (
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
        <span>{formatDate(updatedAt)}</span>
      </div>
    </div>
  );
};