
import { MessageCircle, Upload, Paperclip, Check, Clock, XCircle, FileDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaskActionButtonsProps {
  currentStatus: string;
  isUpdating: boolean;
  onShowDiscussion: () => void;
  onOpenFileUploader: () => void;
  onOpenAttachments: () => void;
  onStatusChange: (status: string) => void;
  onOpenTemplates: () => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  taskId: string;
  isGeneral?: boolean;
  requiresDeliverable?: boolean;
}

export const TaskActionButtons = ({
  currentStatus,
  isUpdating,
  onShowDiscussion,
  onOpenFileUploader,
  onOpenAttachments,
  onStatusChange,
  onOpenTemplates,
  onDelete,
  onEdit,
  taskId,
  isGeneral,
  requiresDeliverable
}: TaskActionButtonsProps) => {
  const { 
    hasNewDiscussion, 
    hasDeliverables, 
    hasTemplates, 
    resetDiscussionFlag 
  } = useTaskButtonStates(taskId);
  const [checking, setChecking] = useState(false);

  console.log("Task button states for task", taskId, {
    hasNewDiscussion,
    hasDeliverables,
    hasTemplates,
    requiresDeliverable
  });

  const handleDiscussionClick = () => {
    resetDiscussionFlag();
    onShowDiscussion();
  };

  const handleStatusChange = async (status: string) => {
    // If not marking as completed or doesn't require deliverables, proceed normally
    if (status !== "completed" || !requiresDeliverable) {
      onStatusChange(status);
      return;
    }

    setChecking(true);
    try {
      // Check if deliverables exist for this task in unified_task_attachments
      const { count, error } = await supabase
        .from("unified_task_attachments")
        .select("*", { count: 'exact', head: true })
        .eq("task_id", taskId);
        
      if (error) {
        console.error("Error checking deliverables:", error);
        toast.error("حدث خطأ أثناء التحقق من المستلمات");
        return;
      }
      
      // If count is 0 and deliverables are required, show error
      if (count === 0 && requiresDeliverable) {
        toast.error("يجب رفع مستلم واحد على الأقل قبل إكمال المهمة");
        return;
      }
      
      // If deliverables exist or not required, proceed with status change
      onStatusChange(status);
      
    } catch (error) {
      console.error("Error checking deliverables:", error);
      toast.error("حدث خطأ أثناء التحقق من المستلمات");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex justify-between items-center mt-3 pt-3 border-t">
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs flex items-center gap-1 ${
            hasNewDiscussion 
              ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={handleDiscussionClick}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          مناقشة
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onOpenFileUploader}
        >
          <Upload className="h-3.5 w-3.5" />
          رفع مستلمات
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center gap-1 ${
            hasDeliverables 
              ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenAttachments}
        >
          <Paperclip className="h-3.5 w-3.5" />
          المستلمات
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center gap-1 ${
            hasTemplates 
              ? "text-purple-500 hover:text-purple-600 hover:bg-purple-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenTemplates}
        >
          <FileDown className="h-3.5 w-3.5" />
          نماذج المهمة
        </Button>
      </div>
      
      <div className="flex gap-2">
        {/* Edit button for general tasks */}
        {isGeneral && onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => onEdit(taskId)}
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500" />
            تعديل
          </Button>
        )}
        
        {/* Status change buttons */}
        {currentStatus !== "completed" ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => handleStatusChange("completed")}
            disabled={isUpdating || checking}
          >
            <Check className="h-3.5 w-3.5 text-green-500" />
            تمت
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => handleStatusChange("pending")}
            disabled={isUpdating || checking}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            قيد التنفيذ
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(taskId)}
          >
            <XCircle className="h-3.5 w-3.5" />
            حذف
          </Button>
        )}
      </div>
    </div>
  );
};
