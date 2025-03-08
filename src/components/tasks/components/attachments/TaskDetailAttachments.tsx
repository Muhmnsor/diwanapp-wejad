
import { Task } from '../../types/task';
import { TaskAttachmentActions } from './TaskAttachmentActions';
import { Card, CardContent } from '@/components/ui/card';
import { Paperclip } from 'lucide-react';

interface TaskDetailAttachmentsProps {
  task: Task;
  className?: string;
  onAttachmentUploaded?: () => void;
}

export const TaskDetailAttachments = ({ task, className = '', onAttachmentUploaded }: TaskDetailAttachmentsProps) => {
  if (!task) return null;
  
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <Paperclip className="h-4 w-4 ml-1" />
          <h3 className="text-sm font-medium">مرفقات المهمة</h3>
        </div>
        
        <TaskAttachmentActions task={task} onAttachmentUploaded={onAttachmentUploaded} />
      </CardContent>
    </Card>
  );
};
