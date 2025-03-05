
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../../project-details/types/task";
import { DeliverablesByTask } from "../deliverables/DeliverablesByTask";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTaskDeliverables, TaskDeliverable } from "../../hooks/useTaskDeliverables";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

interface TaskDeliverablesDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDeliverablesDialog = ({ 
  task,
  open, 
  onOpenChange
}: TaskDeliverablesDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  
  const { 
    isUploading,
    isDeleting,
    uploadDeliverable,
    deleteDeliverable,
    handleDownloadDeliverable
  } = useTaskDeliverables(fetchDeliverables, fetchDeliverables);

  const isCreator = task.created_at ? user?.id === task.created_at : false;
  const isAssignee = task.assigned_to === user?.id;
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  useEffect(() => {
    if (open) {
      fetchDeliverables();
    }
  }, [open, task.id]);

  async function fetchDeliverables() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('task_deliverables')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      toast.error('حدث خطأ أثناء جلب المستلمات');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف أولاً');
      return;
    }

    await uploadDeliverable(selectedFile, task.id);
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('deliverable-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            مستلمات المهمة: {task.title}
          </DialogTitle>
        </DialogHeader>

        {isAssignee && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-2">رفع مستلمات جديدة</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="file"
                id="deliverable-file"
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || isUploading}
                className="whitespace-nowrap"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    رفع المستلمات
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                الملف المحدد: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1 -mr-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DeliverablesByTask
              taskId={task.id}
              deliverables={deliverables}
              onDownload={handleDownloadDeliverable}
              onDelete={isAssignee ? deleteDeliverable : undefined}
              isDeleting={isDeleting}
              canDelete={isAssignee}
              canApprove={isCreator || isAdmin}
              onRefresh={fetchDeliverables}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
