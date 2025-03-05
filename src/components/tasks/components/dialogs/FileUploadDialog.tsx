
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Task } from "../../types/task";
import { useAttachmentOperations } from "../../hooks/useAttachmentOperations";
import { toast } from "sonner";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const FileUploadDialog = ({ isOpen, onClose, task }: FileUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadAttachment, isUploading } = useAttachmentOperations(
    undefined,
    () => {
      toast.success('تم رفع الملف بنجاح');
      onClose();
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !task) return;
    
    // Determine which table the task belongs to
    let taskTable = 'tasks';
    if (task.is_subtask) {
      taskTable = 'subtasks';
    } else if (task.workspace_id) {
      taskTable = 'portfolio_tasks';
    }
    
    const success = await uploadAttachment(
      selectedFile, 
      task.id,
      'assignee', // Category for files uploaded by assignee
      taskTable
    );
    
    if (success) {
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-md w-96 max-w-full" dir="rtl">
        <h3 className="text-lg font-medium mb-4">رفع ملف للمهمة</h3>
        <p className="text-sm text-gray-500 mb-4">يمكنك رفع ملف واحد في كل مرة</p>
        
        <div className="space-y-4">
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>
          
          {selectedFile && (
            <div className="text-sm bg-gray-50 p-2 rounded">
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
          
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                setSelectedFile(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
