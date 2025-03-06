
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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
  taskId,
}: FileUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error("يرجى اختيار ملف أولاً");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `task-attachments/${taskId}/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) throw new Error("Failed to get public URL");
      
      // 3. Save attachment record
      const { error: recordError } = await supabase
        .from("unified_task_attachments")
        .insert({
          task_id: taskId,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          created_by: user?.id,
          task_table: "tasks"
        });
        
      if (recordError) throw recordError;
      
      toast.success("تم رفع الملف بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفع مرفقات للمهمة</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file" className="text-right">اختر ملفًا</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="text-right"
              dir="rtl"
            />
          </div>
          
          {file && (
            <div className="text-sm bg-muted p-2 rounded">
              <p className="font-medium">الملف المختار:</p>
              <p>{file.name}</p>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button 
            type="button" 
            onClick={uploadFile} 
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? (
              "جاري الرفع..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                رفع الملف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
