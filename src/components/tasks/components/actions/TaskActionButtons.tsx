
import { MessageCircle, Upload, Paperclip, Check, Clock, XCircle, FileDown, Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { toast } from "sonner";

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
  requiresDeliverable,
}: TaskActionButtonsProps) => {
  const { 
    hasNewDiscussion, 
    hasDeliverables, 
    hasTemplates, 
    resetDiscussionFlag 
  } = useTaskButtonStates(taskId);

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
    // إذا كانت المهمة تتطلب مستلمات إلزامية وطلب المستخدم إكمالها، نتحقق من وجود مستلمات
    if (status === "completed" && requiresDeliverable && !hasDeliverables) {
      toast.error("لا يمكن إكمال المهمة. المستلمات إلزامية لهذه المهمة", {
        description: "يرجى رفع مستلم واحد على الأقل قبل إكمال المهمة",
        duration: 5000,
      });
      return;
    }
    
    onStatusChange(status);
  };

  return (
    <div className={`flex justify-between items-center mt-3 pt-3 border-t ${isGeneral ? 'bg-opacity-20 bg-blue-50' : ''}`}>
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
          className={`text-xs flex items-center gap-1 ${
            requiresDeliverable && !hasDeliverables
              ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 border" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenFileUploader}
        >
          <Upload className="h-3.5 w-3.5" />
          {requiresDeliverable && !hasDeliverables && <AlertCircle className="h-2.5 w-2.5 text-red-500" />}
          رفع مستلمات
          {requiresDeliverable && !hasDeliverables && "*"}
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
            disabled={isUpdating}
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
            disabled={isUpdating}
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
