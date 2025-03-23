
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

interface TaskAttachmentFieldProps {
  attachment: File[] | null;
  setAttachment: (files: File[] | null) => void;
  category: string;
  label?: string;
}

export const TaskAttachmentField: React.FC<TaskAttachmentFieldProps> = ({
  attachment,
  setAttachment,
  category,
  label = "إرفاق نماذج"
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachment(filesArray);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`attachment-${category}`}>{label}</Label>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          id={`attachment-${category}`}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4 ml-2" />
          {label}
        </Button>

        {attachment && attachment.length > 0 && (
          <div className="mt-2">
            {attachment.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md mb-1">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleRemoveFile}
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
