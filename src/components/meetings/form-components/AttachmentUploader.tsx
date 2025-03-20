
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, X, FileIcon, FileText } from "lucide-react";
import { bytesToSize } from "@/lib/utils";

interface TempAttachment {
  temp_id: string;
  file: File;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_progress: number;
}

interface AttachmentUploaderProps {
  attachments: TempAttachment[];
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onAddAttachment(files[i]);
      }
      // Reset input
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        onAddAttachment(e.dataTransfer.files[i]);
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileIcon className="h-6 w-6 text-blue-500" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FileText className="h-6 w-6 text-blue-700" />;
    } else if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return <FileText className="h-6 w-6 text-green-600" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 rtl">
      <div
        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <FilePlus className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
        <Button variant="outline" type="button" size="sm">
          اختر ملفات
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">الملفات المرفقة</h3>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.temp_id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(attachment.file_type)}
                  <div>
                    <p className="font-medium">{attachment.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {bytesToSize(attachment.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveAttachment(attachment.temp_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
