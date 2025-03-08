
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTaskAttachments } from "../services/uploadService";
import { AttachmentCategory } from "../services/uploadService";

interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  attachment_category: AttachmentCategory;
}

export const useTaskAttachments = (taskId: string, category?: AttachmentCategory) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAttachments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const attachmentsData = await getTaskAttachments(taskId, category);
      setAttachments(attachmentsData);
    } catch (err) {
      console.error("Error fetching task attachments:", err);
      setError("فشل في تحميل المرفقات");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId, category]);
  
  return {
    attachments,
    isLoading,
    error,
    refreshAttachments: fetchAttachments
  };
};
