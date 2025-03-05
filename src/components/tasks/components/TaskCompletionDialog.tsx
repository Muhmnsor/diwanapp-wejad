
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Task } from "../types/task";
import { uploadAttachment } from "../services/uploadService";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

interface TaskCompletionDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (taskId: string, status: string) => void;
}

export const TaskCompletionDialog = ({
  task,
  open,
  onOpenChange,
  onStatusChange
}: TaskCompletionDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // تغيير حالة المهمة إلى مكتملة
      onStatusChange(task.id, "completed");
      
      // إذا تم اختيار ملف، قم برفعه
      if (selectedFile) {
        const uploadResult = await uploadAttachment(selectedFile);
        
        if (uploadResult && uploadResult.url) {
          // حفظ بيانات المرفق في قاعدة البيانات
          const { error } = await supabase
            .from('task_attachments_completion')
            .insert({
              task_id: task.id,
              file_name: selectedFile.name,
              file_url: uploadResult.url,
              file_type: selectedFile.type,
              created_by: await supabase.auth.getUser().then(res => res.data.user?.id),
              comments: comment
            });
            
          if (error) {
            console.error("Error saving attachment metadata:", error);
            toast.error("حدث خطأ أثناء حفظ بيانات المرفق");
          } else {
            toast.success("تم إكمال المهمة وإرفاق الملف بنجاح");
          }
        }
      } else {
        toast.success("تم إكمال المهمة بنجاح");
      }

      // إغلاق النافذة بعد الإرسال
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("حدث خطأ أثناء إكمال المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إكمال المهمة</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>هل أنت متأكد من إكمال المهمة؟</Label>
            <p className="text-sm text-muted-foreground">
              المهمة: {task.title}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completion-comment">تعليق (اختياري)</Label>
            <textarea
              id="completion-comment"
              className="w-full p-2 border rounded-md"
              placeholder="أضف تعليقاً حول إكمال المهمة..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>إرفاق ملف (اختياري)</Label>
            {!selectedFile ? (
              <div className="flex justify-center border-2 border-dashed rounded-md p-6">
                <input
                  type="file"
                  id="completion-file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.docx,.xlsx,.pptx"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("completion-file")?.click()}
                >
                  <Paperclip className="h-4 w-4 ml-2" />
                  اختر ملفاً للإرفاق
                </Button>
              </div>
            ) : (
              <div className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[250px]">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    إزالة
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الإكمال...
              </>
            ) : (
              "إكمال المهمة"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
