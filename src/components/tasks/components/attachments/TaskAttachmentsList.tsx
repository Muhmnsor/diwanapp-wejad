
import { useState, useEffect } from 'react';
import { Paperclip } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentExpandButton } from './AttachmentExpandButton';
import { AttachmentListLoading } from './AttachmentListLoading';
import { useAttachmentOperations, Attachment } from '../../hooks/useAttachmentOperations';
import { supabase } from '@/integrations/supabase/client';

interface TaskAttachmentsListProps {
  taskId: string;
  showTitle?: boolean;
  maxItems?: number;
  showCategory?: boolean;
  className?: string;
  onDelete?: () => void;
}

export const TaskAttachmentsList = ({
  taskId,
  showTitle = true,
  maxItems = 3,
  showCategory = true,
  className = '',
  onDelete
}: TaskAttachmentsListProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuthStore();
  const { deleteAttachment, isDeleting, handleDownloadAttachment } = useAttachmentOperations(
    () => {
      fetchAttachments();
      if (onDelete) {
        onDelete();
      }
    }
  );
  
  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching attachments for task:', taskId);
      
      // Fetch attachments from unified_task_attachments table
      const { data, error } = await supabase
        .from('unified_task_attachments')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) {
        console.error('Error fetching attachments:', error);
        throw error;
      }
      
      setAttachments(data as Attachment[]);
    } catch (error) {
      console.error('Error in fetchAttachments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);
  
  const canDelete = (createdBy: string | null) => {
    return user?.id === createdBy || user?.isAdmin;
  };

  const handleDelete = async (id: string) => {
    await deleteAttachment(id);
  };
  
  if (isLoading) {
    return <AttachmentListLoading showTitle={showTitle} className={className} />;
  }
  
  if (attachments.length === 0) {
    return null;
  }
  
  const displayAttachments = showAll ? attachments : attachments.slice(0, maxItems);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showTitle && (
        <div className="flex items-center text-sm font-medium mb-2">
          <Paperclip className="h-4 w-4 ml-1" />
          <span>المرفقات ({attachments.length})</span>
        </div>
      )}
      
      <div className="space-y-2">
        {displayAttachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            showCategory={showCategory}
            canDelete={canDelete(attachment.created_by)}
            onDelete={handleDelete}
            isDeleting={isDeleting[attachment.id]}
            onDownload={handleDownloadAttachment}
          />
        ))}
        
        {attachments.length > maxItems && (
          <AttachmentExpandButton 
            showAll={showAll} 
            setShowAll={setShowAll} 
            totalCount={attachments.length} 
          />
        )}
      </div>
    </div>
  );
};
