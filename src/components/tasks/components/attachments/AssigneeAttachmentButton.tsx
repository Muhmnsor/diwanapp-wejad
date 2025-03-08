
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { toast } from "sonner";

export interface AssigneeAttachmentButtonProps {
  taskId: string;
  onAttachmentUploaded: () => void;
  buttonText?: string;
}

export const AssigneeAttachmentButton = ({ 
  taskId, 
  onAttachmentUploaded,
  buttonText = "ملفات المكلف"
}: AssigneeAttachmentButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Implement file upload logic here
      // This is a placeholder for the actual implementation
      console.log("Uploading assignee file for task:", taskId);
      
      // Call the callback function to notify that an attachment was uploaded
      onAttachmentUploaded();
      
      toast.success("تم رفع الملف بنجاح");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("فشل في رفع الملف");
    } finally {
      setIsUploading(false);
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
        <UserIcon className="h-4 w-4 mr-1" />
        {buttonText}
      </Button>
      <input
        id={`assignee-attachment-${taskId}`}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </>
  );
};
