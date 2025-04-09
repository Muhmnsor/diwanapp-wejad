import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Paperclip } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "./RichTextEditor";

interface CorrespondenceResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distributionId: string;
  correspondenceId: string;
}

export const CorrespondenceResponseDialog: React.FC<CorrespondenceResponseDialogProps> = ({
  isOpen,
  onClose,
  distributionId,
  correspondenceId,
}) => {
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { addToHistory } = useCorrespondence();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // تحديث حالة التوزيع
      const { error } = await supabase
        .from('correspondence_distribution')
        .update({
          response_text: responseText,
          response_date: new Date().toISOString(),
          status: 'مكتمل'
        })
        .eq('id', distributionId);
        
      if (error) throw error;
      
      // رفع المرفقات إذا وجدت
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `response_${distributionId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `correspondence/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // ربط المرفق بالمعاملة
          await supabase
            .from('correspondence_attachments')
            .insert([
              {
                correspondence_id: correspondenceId,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                is_response_attachment: true,
                distribution_id: distributionId
              }
            ]);
        }
      }
      
      // إضافة إلى سجل التاريخ
      await addToHistory(
        correspondenceId,
        'الرد على المعاملة',
        undefined, // يمكن استبدالها بمعرف المستخدم الحالي
        `تم الرد على المعاملة الموزعة مع إضافة ${files.length} مرفقات`
      );
      
      toast({
        title: "تم إرسال الرد بنجاح",
        description: "تم حفظ الرد على المعاملة والمرفقات"
      });
      
      onClose();
    } catch (error) {
      console.error("Error responding to distribution:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الرد",
        description: "حدث خطأ أثناء إرسال الرد، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            الرد على المعاملة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="response_text">نص الرد</Label>
            <RichTextEditor
              value={responseText}
              onChange={setResponseText}
              placeholder="أدخل الرد على المعاملة"
              minHeight="150px"
            />
          </div>
          
          <div>
            <Label>مرفقات الرد</Label>
            <div className="mt-2 p-4 border border-dashed rounded-md">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 ml-2 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      إزالة
                    </Button>
                  </div>
                ))}

                <div className="flex items-center justify-center p-4">
                  <label htmlFor="response-file-upload" className="cursor-pointer flex items-center text-primary">
                    <PlusCircle className="h-4 w-4 ml-2" />
                    <span>إضافة مرفق للرد</span>
                    <input id="response-file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال الرد'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
