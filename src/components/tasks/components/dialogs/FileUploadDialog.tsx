
import { useState } from "react";
import { Task } from "../../types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAttachmentOperations } from "../../hooks/useAttachmentOperations";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const FileUploadDialog = ({ isOpen, onClose, task }: FileUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadDeliverable, isUploading } = useAttachmentOperations(
    () => {
      // This callback will be executed after successful deletion
      console.log("Delete callback called");
    },
    () => {
      // This callback will be executed after successful upload
      console.log("Upload callback executed successfully");
      setSelectedFile(null);
      onClose();
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !task.id) return;
    
    console.log("Starting deliverable upload for task:", task.id);
    console.log("Is task a subtask?", task.is_subtask);
    
    let taskTable = 'tasks';
    if (task.is_subtask) {
      taskTable = 'subtasks';
    } else if (task.workspace_id) {
      taskTable = 'portfolio_tasks';
    }
    
    console.log("Using task table:", taskTable);
    
    await uploadDeliverable(
      selectedFile,
      task.id,
      taskTable
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>رفع مستلم المهمة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-md text-sm border border-amber-200 mb-2">
            <p className="font-medium text-amber-700">معلومات عن المستلمات:</p>
            <p className="text-amber-600 mt-1">المستلمات هي الملفات النهائية التي يتم تسليمها كإنجاز للمهمة، وتخضع للمراجعة والاعتماد من منشئ المهمة.</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">اختر ملف المستلم:</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            إلغاء
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                رفع المستلم
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
