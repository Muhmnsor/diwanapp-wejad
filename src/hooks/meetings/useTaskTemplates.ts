
import { useState } from "react";
import { uploadAttachment, saveAttachmentReference } from "@/components/tasks/services/uploadService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTaskTemplates = () => {
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadTemplates = async (taskId: string) => {
    if (!templates || templates.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      for (const file of templates) {
        // Upload the file
        const uploadResult = await uploadAttachment(file, 'template');
        
        if (uploadResult.error) {
          console.error('Error uploading template:', uploadResult.error);
          toast.error(`فشل في رفع النموذج ${file.name}`);
          continue;
        }
        
        // Save reference to the file in unified_task_attachments
        await saveAttachmentReference(
          taskId,
          uploadResult.url,
          file.name,
          file.type,
          'template'
        );
        
        // Also save in task_templates for compatibility
        await supabase
          .from('task_templates')
          .insert({
            task_id: taskId,
            task_table: 'meeting_tasks',
            file_url: uploadResult.url,
            file_name: file.name,
            file_type: file.type,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });
      }
      
      toast.success("تم رفع النماذج بنجاح");
    } catch (error) {
      console.error("Error uploading templates:", error);
      toast.error("حدث خطأ أثناء رفع النماذج");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    templates,
    setTemplates,
    isUploading,
    uploadTemplates
  };
};
