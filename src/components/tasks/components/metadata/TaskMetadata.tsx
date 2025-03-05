
import { ArrowRight, Briefcase, Calendar, FileIcon, Download } from "lucide-react";
import { formatDueDate } from "../../utils/taskFormatters";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface TaskMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask: boolean;
  parentTaskId?: string | null;
  taskId?: string | null;
}

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  attachment_category?: string;
}

export const TaskMetadata = ({ dueDate, projectName, isSubtask, parentTaskId, taskId }: TaskMetadataProps) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskAttachments();
    }
  }, [taskId]);

  const fetchTaskAttachments = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      // First try to fetch from portfolio_task_attachments
      const { data: portfolioAttachments, error: portfolioError } = await supabase
        .from("portfolio_task_attachments")
        .select("*")
        .eq("task_id", taskId);

      // Then try to fetch from task_attachments
      const { data: taskAttachments, error: taskError } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId);

      // Combine both sources of attachments
      const combinedAttachments = [
        ...(portfolioAttachments || []),
        ...(taskAttachments || [])
      ];

      setAttachments(combinedAttachments as TaskAttachment[]);
    } catch (error) {
      console.error("Error fetching task attachments:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-wrap items-center gap-4">
      {dueDate && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 ml-1" />
          <span>{formatDueDate(dueDate)}</span>
        </div>
      )}
      
      {projectName && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 ml-1" />
          <span>{projectName}</span>
        </div>
      )}
      
      {isSubtask && parentTaskId && (
        <div className="flex items-center text-sm text-blue-500">
          <ArrowRight className="h-4 w-4 ml-1" />
          <span>تابعة لمهمة رئيسية</span>
        </div>
      )}

      {creatorAttachments.length > 0 && (
        <div className="w-full mt-2">
          <div className="text-sm font-medium mb-1">مرفقات منشئ المهمة:</div>
          <div className="space-y-1">
            {creatorAttachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center bg-blue-50 rounded p-1.5 text-sm">
                <FileIcon className="h-4 w-4 text-blue-500 ml-2 flex-shrink-0" />
                <span className="flex-1 truncate">{attachment.file_name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                  title="تنزيل الملف"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {assigneeAttachments.length > 0 && (
        <div className="w-full mt-2">
          <div className="text-sm font-medium mb-1">مرفقات المكلف بالمهمة:</div>
          <div className="space-y-1">
            {assigneeAttachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center bg-green-50 rounded p-1.5 text-sm">
                <FileIcon className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                <span className="flex-1 truncate">{attachment.file_name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                  title="تنزيل الملف"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
