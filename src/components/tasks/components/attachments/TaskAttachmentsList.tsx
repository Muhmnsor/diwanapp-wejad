
import { useState, useEffect } from 'react';
import { File, Paperclip, Download, Trash2 } from 'lucide-react';
import { getTaskAttachments } from '../../services/uploadService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/refactored-auth';

interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  attachment_category: string;
  created_by: string | null;
  created_at: string;
}

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
  
  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const data = await getTaskAttachments(taskId);
      setAttachments(data as Attachment[]);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'creator':
        return 'منشئ المهمة';
      case 'assignee':
        return 'المكلف';
      case 'comment':
        return 'تعليق';
      default:
        return category;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'creator':
        return 'bg-blue-100 text-blue-800';
      case 'assignee':
        return 'bg-green-100 text-green-800';
      case 'comment':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleDeleteAttachment = async (id: string, tableName: string = 'unified_task_attachments') => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        if (tableName === 'unified_task_attachments') {
          // Try with the fallback table
          return handleDeleteAttachment(id, 'task_attachments');
        }
        throw error;
      }
      
      setAttachments(attachments.filter(att => att.id !== id));
      toast.success('تم حذف المرفق بنجاح');
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('فشل حذف المرفق');
    }
  };
  
  const canDelete = (createdBy: string | null) => {
    return user?.id === createdBy || user?.isAdmin;
  };
  
  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showTitle && <h4 className="text-sm font-medium mb-2">المرفقات</h4>}
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
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
          <div 
            key={attachment.id} 
            className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm border border-gray-100"
          >
            <div className="flex items-center min-w-0">
              <File className="h-4 w-4 ml-2 text-gray-500 shrink-0" />
              <span className="truncate max-w-[150px]">{attachment.file_name}</span>
              
              {showCategory && attachment.attachment_category && (
                <Badge 
                  variant="outline" 
                  className={`mr-2 text-xs ${getCategoryColor(attachment.attachment_category)}`}
                >
                  {getCategoryLabel(attachment.attachment_category)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(attachment.created_at), { 
                        addSuffix: true,
                        locale: ar 
                      })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تم الرفع {new Date(attachment.created_at).toLocaleString('ar')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <a 
                href={attachment.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Download className="h-4 w-4 text-gray-600" />
              </a>
              
              {canDelete(attachment.created_by) && (
                <Button
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDeleteAttachment(attachment.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {attachments.length > maxItems && (
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'عرض أقل' : `عرض كل المرفقات (${attachments.length})`}
          </Button>
        )}
      </div>
    </div>
  );
};
