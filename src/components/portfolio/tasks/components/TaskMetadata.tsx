
import { Calendar, User, Clock, Paperclip } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/components/finance/reports/utils/formatters';

interface TaskMetadataProps {
  dueDate: string | null;
  assignedTo: string | null;
  updatedAt: string;
  taskId?: string;
}

// Helper component for user info
const AssignedUser = ({ userId }: { userId: string }) => {
  const { data: assignedUser } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching assigned user:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId
  });

  if (!assignedUser) return null;

  return (
    <div className="flex items-center gap-1">
      <User className="h-4 w-4" />
      <span className="text-gray-500">المسؤول:</span>
      <span>{assignedUser.email}</span>
    </div>
  );
};

// Helper component for date info
const DateInfo = ({ 
  label, 
  dateString,
  icon
}: { 
  label: string; 
  dateString: string | null;
  icon: React.ReactNode;
}) => {
  if (!dateString) return null;
  
  const formattedDate = new Date(dateString).toLocaleDateString('ar-SA');
  
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className="text-gray-500">{label}</span>
      <span>{formattedDate}</span>
    </div>
  );
};

// Helper component for attachments count
const AttachmentsCount = ({ taskId }: { taskId: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const getAttachmentsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('unified_task_attachments')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', taskId);
          
        if (!error && count !== null) {
          setCount(count);
        }
      } catch (error) {
        console.error('Error fetching attachments count:', error);
      }
    };
    
    if (taskId) {
      getAttachmentsCount();
    }
  }, [taskId]);
  
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-1">
      <Paperclip className="h-4 w-4" />
      <span className="text-gray-500">المرفقات:</span>
      <span>{count}</span>
    </div>
  );
};

export const TaskMetadata = ({ dueDate, assignedTo, updatedAt, taskId }: TaskMetadataProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <div className="flex items-center gap-4">
        {dueDate && (
          <DateInfo 
            label="تاريخ التنفيذ:" 
            dateString={dueDate}
            icon={<Calendar className="h-4 w-4" />}
          />
        )}
        
        {assignedTo && <AssignedUser userId={assignedTo} />}
        
        {taskId && <AttachmentsCount taskId={taskId} />}
      </div>
      
      <DateInfo 
        label="آخر تحديث:" 
        dateString={updatedAt}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
};
