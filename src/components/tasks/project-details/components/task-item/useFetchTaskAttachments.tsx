
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  created_by: string;
}

export function useFetchTaskAttachments(taskId: string, assignedTo: string | null | undefined) {
  const [assigneeAttachment, setAssigneeAttachment] = useState<TaskAttachment | null>(null);
  
  useEffect(() => {
    if (taskId && assignedTo) {
      fetchAssigneeAttachment(taskId, assignedTo);
    }
  }, [taskId, assignedTo]);

  const fetchAssigneeAttachment = async (taskId: string, assignedTo: string) => {
    try {
      const { data: portfolioAttachments, error: portfolioError } = await supabase
        .from("portfolio_task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .eq("created_by", assignedTo)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: taskAttachments, error: taskError } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .eq("created_by", assignedTo)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if ((portfolioAttachments && portfolioAttachments.length > 0) || 
          (taskAttachments && taskAttachments.length > 0)) {
        
        const attachment = portfolioAttachments?.length > 0 
          ? portfolioAttachments[0] 
          : taskAttachments![0];
          
        setAssigneeAttachment(attachment as TaskAttachment);
      }
    } catch (error) {
      console.error("Error fetching assignee attachment:", error);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    assigneeAttachment,
    handleDownload
  };
}
