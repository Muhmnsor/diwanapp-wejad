
import { useState } from 'react';
import { AssigneeAttachmentButton } from './AssigneeAttachmentButton';
import { TaskAttachmentsList } from './TaskAttachmentsList';
import { Task } from '../../types/task';
import { useAuthStore } from '@/store/refactored-auth';

interface TaskAttachmentActionsProps {
  task: Task;
  className?: string;
}

export const TaskAttachmentActions = ({ task, className = '' }: TaskAttachmentActionsProps) => {
  const { user } = useAuthStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const isAssigned = user?.id === task.assigned_to;
  
  // Force refresh the attachments list
  const handleAttachmentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className={className}>
      {isAssigned && (
        <div className="mb-3">
          <AssigneeAttachmentButton 
            taskId={task.id}
            onAttachmentUploaded={handleAttachmentUploaded}
            buttonText="إضافة مرفق من المكلف"
          />
        </div>
      )}
      
      <TaskAttachmentsList 
        key={refreshTrigger} 
        taskId={task.id} 
        onDelete={handleAttachmentUploaded}
      />
    </div>
  );
};
