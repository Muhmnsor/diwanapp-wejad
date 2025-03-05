
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TaskAttachmentsProps {
  taskId: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
  comments?: string;
}

export const TaskAttachments = ({ taskId }: TaskAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const { data, error } = await supabase
          .from('task_attachments_completion')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setAttachments(data || []);
      } catch (error) {
        console.error("Error fetching task attachments:", error);
        toast.error("حدث خطأ أثناء تحميل المرفقات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachments();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">جاري تحميل المرفقات...</p>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">لا توجد مرفقات لهذه المهمة</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">مرفقات المهمة:</h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="p-3 border rounded-md bg-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">{attachment.file_name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(attachment.file_url, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {attachment.comments && (
              <p className="mt-2 text-sm text-muted-foreground bg-accent/10 p-2 rounded">
                {attachment.comments}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
