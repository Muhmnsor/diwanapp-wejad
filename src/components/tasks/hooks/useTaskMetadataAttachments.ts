
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  attachment_category?: string;
  file_type?: string;
}

interface TaskDeliverable {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  status?: string;
  file_type?: string;
  feedback?: string;
}

export function useTaskMetadataAttachments(taskId: string | undefined) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskAttachments();
      fetchTaskDeliverables();
    }
  }, [taskId]);

  const fetchTaskAttachments = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      console.log("Fetching attachments for task:", taskId);
      
      // جلب المرفقات من جدول task_attachments
      const { data: taskAttachments, error: taskAttachmentsError } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId);
      
      if (taskAttachmentsError) {
        console.error("Error fetching task attachments:", taskAttachmentsError);
      }
      
      // جلب المرفقات من جدول portfolio_task_attachments
      const { data: portfolioAttachments, error: portfolioError } = await supabase
        .from("portfolio_task_attachments")
        .select("*")
        .eq("task_id", taskId);
      
      if (portfolioError) {
        console.error("Error fetching portfolio task attachments:", portfolioError);
      }
      
      // دمج المرفقات من كلا المصدرين
      const combinedAttachments = [
        ...(taskAttachments || []),
        ...(portfolioAttachments || [])
      ];
      
      console.log("Found attachments:", combinedAttachments);
      setAttachments(combinedAttachments as TaskAttachment[]);
    } catch (error) {
      console.error("Error in fetchTaskAttachments:", error);
    } finally {
      setLoading(false);
    }
  };

  // جلب المستلمات من جدول task_deliverables
  const fetchTaskDeliverables = async () => {
    if (!taskId) return;
    
    setLoadingDeliverables(true);
    try {
      console.log("Fetching deliverables for task:", taskId);
      
      // هذا المسار المحدد لجلب المستلمات
      const { data: taskDeliverables, error } = await supabase
        .from("task_deliverables")
        .select("*")
        .eq("task_id", taskId)
        .eq("task_table", "tasks");
      
      if (error) {
        console.error("Error fetching task deliverables:", error);
      } else {
        console.log("Found deliverables:", taskDeliverables);
        setDeliverables(taskDeliverables || []);
      }
    } catch (error) {
      console.error("Error in fetchTaskDeliverables:", error);
    } finally {
      setLoadingDeliverables(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // تصنيف المرفقات حسب النوع
  const creatorAttachments = attachments.filter(att => 
    att.attachment_category === 'creator' || !att.attachment_category);
  const assigneeAttachments = attachments.filter(att => 
    att.attachment_category === 'assignee');
  const commentAttachments = attachments.filter(att => 
    att.attachment_category === 'comment');

  // إضافة وظيفة لإعادة تحميل المرفقات
  const refreshAttachments = () => {
    fetchTaskAttachments();
    fetchTaskDeliverables();
  };

  return {
    attachments,
    loading,
    creatorAttachments,
    assigneeAttachments,
    commentAttachments,
    handleDownload,
    refreshAttachments,
    deliverables,
    loadingDeliverables
  };
}
