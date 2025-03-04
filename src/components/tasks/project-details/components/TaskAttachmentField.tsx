
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Paperclip, X, Loader2 } from "lucide-react";
import { uploadAttachment } from "../../services/uploadService";
import { toast } from "sonner";

interface TaskAttachmentFieldProps {
  attachments: { url: string; name: string; type: string }[];
  setAttachments: React.Dispatch<React.SetStateAction<{ url: string; name: string; type: string }[]>>;
}

export const TaskAttachmentField = ({ attachments, setAttachments }: TaskAttachmentFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadAttachment(file);
      if (result && result.url) {
        setAttachments([
          ...attachments,
          {
            url: result.url,
            name: file.name,
            type: file.type,
          },
        ]);
        toast.success("تم رفع المرفق بنجاح");
      } else {
        toast.error("فشل في رفع المرفق");
      }
    } catch (error) {
      console.error("خطأ في رفع الملف:", error);
      toast.error("حدث خطأ أثناء رفع المرفق");
    } finally {
      setIsUploading(false);
      // إعادة تعيين حقل الإدخال
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="attachment">المرفقات</Label>
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("task-attachment")?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-sm"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            إضافة مرفق
            <input
              type="file"
              id="task-attachment"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
            />
          </Button>
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-xs text-gray-500">المرفقات ({attachments.length})</Label>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm truncate" title={attachment.name}>
                      {attachment.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                    className="h-6 w-6 p-0"
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
