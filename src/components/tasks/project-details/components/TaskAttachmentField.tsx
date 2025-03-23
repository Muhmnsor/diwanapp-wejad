
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileDown } from "lucide-react";
import { toast } from "sonner";

interface TaskAttachmentFieldProps {
  attachment: File[] | null;
  setAttachment: (file: File[] | null) => void;
  category?: 'creator' | 'assignee' | 'comment' | 'template';
}

export const TaskAttachmentField = ({ 
  attachment, 
  setAttachment, 
  category = 'template' 
}: TaskAttachmentFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت");
        return;
      }
      
      console.log(`Adding new template file with category: ${category}`);
      
      // Add new file to existing files array with category metadata
      const fileWithMetadata = Object.assign(selectedFile, { 
        category,
        attachment_category: category // Add this explicit property for consistent database storage
      });
      
      console.log("File with metadata:", fileWithMetadata);
      
      const updatedAttachments = attachment ? [...attachment, fileWithMetadata] : [fileWithMetadata];
      setAttachment(updatedAttachments);
    }
    
    // Clear input value to allow selecting the same file again
    if (e.target.value) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    if (attachment) {
      const updatedAttachments = [...attachment];
      updatedAttachments.splice(index, 1);
      setAttachment(updatedAttachments.length > 0 ? updatedAttachments : null);
    }
  };

  const labelText = "نماذج المهمة";
  const buttonText = "إضافة نموذج";

  return (
    <div className="space-y-2">
      <Label htmlFor="attachment">{labelText}</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById("attachment")?.click()} 
            className="relative"
          >
            <FileDown className="h-4 w-4 ml-2" />
            {buttonText}
          </Button>
          <input
            type="file"
            id="attachment"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
        </div>
        
        {attachment && attachment.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachment.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 break-all">
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFile(index)} 
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
