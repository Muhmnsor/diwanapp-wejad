
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

export interface TaskAttachmentFieldProps {
  attachment: File[] | null;
  setAttachment: (files: File[] | null) => void;
  category?: string;
  label?: string;
}

export const TaskAttachmentField: React.FC<TaskAttachmentFieldProps> = ({ 
  attachment, 
  setAttachment,
  category,
  label = "المرفقات"
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachment(filesArray);
    }
  };

  const removeFile = (index: number) => {
    if (!attachment) return;
    
    const updatedFiles = [...attachment];
    updatedFiles.splice(index, 1);
    
    if (updatedFiles.length === 0) {
      setAttachment(null);
    } else {
      setAttachment(updatedFiles);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="attachment">{label}</Label>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="attachment"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("attachment")?.click()}
            className="w-full flex items-center justify-center gap-2"
          >
            <Paperclip className="h-4 w-4" />
            <span>إرفاق ملفات</span>
          </Button>
        </div>
        
        {attachment && attachment.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">الملفات المرفقة:</p>
            <div className="flex flex-col gap-1">
              {attachment.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
