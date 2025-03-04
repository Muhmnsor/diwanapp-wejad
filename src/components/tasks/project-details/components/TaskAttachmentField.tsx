
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface TaskAttachmentFieldProps {
  attachment: File | null;
  setAttachment: (file: File | null) => void;
}

export const TaskAttachmentField = ({ attachment, setAttachment }: TaskAttachmentFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت");
        return;
      }
      setAttachment(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="attachment">المرفقات</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById("attachment")?.click()} 
            className="relative"
          >
            <Paperclip className="h-4 w-4 ml-2" />
            إضافة مرفق
          </Button>
          <input
            type="file"
            id="attachment"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
        </div>
        
        {attachment && (
          <div className="flex items-center gap-2 mt-2 p-2 border rounded-md bg-gray-50">
            <span className="flex-1 truncate text-sm">{attachment.name}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveFile} 
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
