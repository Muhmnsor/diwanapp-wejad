
import { useState, useEffect } from 'react';
import { getTaskAttachments } from '../services/uploadService';

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

export const useTaskAttachments = (taskId: string) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchAttachments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTaskAttachments(taskId);
      setAttachments(data as Attachment[]);
    } catch (err) {
      console.error('Error fetching task attachments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch attachments'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);
  
  return {
    attachments,
    isLoading,
    error,
    refetch: fetchAttachments,
    
    // Helper methods
    getCreatorAttachments: () => attachments.filter(a => a.attachment_category === 'creator'),
    getAssigneeAttachments: () => attachments.filter(a => a.attachment_category === 'assignee'),
    getCommentAttachments: () => attachments.filter(a => a.attachment_category === 'comment'),
    
    // Stats
    getTotalCount: () => attachments.length,
    getCategoryCount: (category: string) => attachments.filter(a => a.attachment_category === category).length
  };
};
