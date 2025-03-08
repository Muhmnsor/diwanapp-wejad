
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getTaskAttachments } from "../services/uploadService";

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_by: string;
  created_at: string;
  attachment_category: 'creator' | 'assignee' | 'comment' | 'template';
}

export const useTaskAttachments = (taskId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [creatorAttachments, setCreatorAttachments] = useState<TaskAttachment[]>([]);
  const [assigneeAttachments, setAssigneeAttachments] = useState<TaskAttachment[]>([]);
  
  const fetchAttachments = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      // Get creator attachments
      const creatorAttachments = await getTaskAttachments(taskId, 'creator');
      setCreatorAttachments(creatorAttachments as TaskAttachment[]);
      
      // Get assignee attachments
      const assigneeAttachments = await getTaskAttachments(taskId, 'assignee');
      setAssigneeAttachments(assigneeAttachments as TaskAttachment[]);
      
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("فشل في تحميل المرفقات");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAttachments();
  }, [taskId]);
  
  return {
    isLoading,
    creatorAttachments,
    assigneeAttachments,
    refreshAttachments: fetchAttachments
  };
};
