
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";

interface AssigneeAttachmentButtonProps {
  taskId: string;
  onAttachmentUploaded?: () => void;
}

export const AssigneeAttachmentButton = ({ taskId, onAttachmentUploaded }: AssigneeAttachmentButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload the file
      const uploadResult = await uploadAttachment(file, 'assignee');
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      
      if (uploadResult.url) {
        // Save reference to the database
        await saveAttachmentReference(
          taskId,
          uploadResult.url,
          file.name,
          file.type,
          'assignee'
        );
        
        toast.success("تم رفع الملف بنجاح");
        if (onAttachmentUploaded) {
          onAttachmentUploaded();
        }
      }
    } catch (error) {
      console.error("Error uploading assignee attachment:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <input 
        type="file" 
        id="assignee-attachment" 
        className="hidden" 
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-sm mr-2"
        onClick={() => document.getElementById('assignee-attachment')?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <CheckCircle className="h-4 w-4 animate-pulse text-green-500" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
        إرفاق مستند
      </Button>
    </>
  );
};
