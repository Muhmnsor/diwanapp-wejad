
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";
import { toast } from "sonner";

export interface AssigneeAttachmentButtonProps {
  taskId: string;
  onAttachmentUploaded: () => void;
  buttonText?: string;
}

export const AssigneeAttachmentButton = ({ 
  taskId, 
  onAttachmentUploaded,
  buttonText = "إرفاق ملف"
}: AssigneeAttachmentButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const { url, path, error } = await uploadAttachment(file, "assignee");
      
      if (error || !url) {
        throw new Error(error || "فشل في رفع الملف");
      }
      
      // Create reference in the database
      await saveAttachmentReference(
        taskId,
        url,
        file.name,
        file.type,
        "assignee"
      );
      
      toast.success("تم رفع الملف بنجاح");
      onAttachmentUploaded();
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };
  
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        className="file-upload-btn"
        onClick={() => document.getElementById(`assignee-attachment-${taskId}`)?.click()}
      >
        <PaperclipIcon className="h-4 w-4 mr-1" />
        {isUploading ? "جاري الرفع..." : buttonText}
      </Button>
      <input
        id={`assignee-attachment-${taskId}`}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};
