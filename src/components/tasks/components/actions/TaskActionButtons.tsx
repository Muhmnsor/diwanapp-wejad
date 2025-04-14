import { MessageCircle, Upload, Paperclip, Check, Clock, XCircle, FileDown, Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore"; // استيراد استخدام الحالة للمستخدم
import { usePermissionCheck } from "@/components/tasks/project-details/hooks/usePermissionCheck";


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
  createdBy?: string; // إضافة الحقول الجديدة
  projectManager?: string;
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
  createdBy,
  projectManager,
}: TaskActionButtonsProps) => {
  const { 
    hasNewDiscussion, 
    hasDeliverables, 
    hasTemplates, 
    resetDiscussionFlag 
  } = useTaskButtonStates(taskId);

  const { user } = useAuthStore(); // الحصول على بيانات المستخدم الحالي
  const { canEdit } = usePermissionCheck({
    createdBy,
    projectManager,
    isGeneral,
  }); // التحقق من الصلاحيات بناءً على المستخدم

  console.log("Task button states for task", taskId, {
    hasNewDiscussion,
    hasDeliverables,
    hasTemplates,
    requiresDeliverable,
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
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm ${
            hasNewDiscussion 
              ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={handleDiscussionClick}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden md:inline">مناقشة</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm ${
            requiresDeliverable && !hasDeliverables
              ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 border" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenFileUploader}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            رفع مستلمات
            {requiresDeliverable && !hasDeliverables && "*"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm ${
            hasDeliverables 
              ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenAttachments}
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span className="hidden md:inline">المستلمات</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm ${
            hasTemplates 
              ? "text-purple-500 hover:text-purple-600 hover:bg-purple-50" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onOpenTemplates}
        >
          <FileDown className="h-3.5 w-3.5" />
          <span className="hidden md:inline">نماذج المهمة</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {/* Edit button based on permission */}
        {canEdit && onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm"
            onClick={() => onEdit(taskId)}
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden md:inline">تعديل</span>
          </Button>
        )}
        
        {/* Status change buttons */}
        {currentStatus !== "completed" ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm"
            onClick={() => handleStatusChange("completed")}
            disabled={isUpdating}
          >
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span className="hidden md:inline">تمت</span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm"
            onClick={() => handleStatusChange("pending")}
            disabled={isUpdating}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden md:inline">قيد التنفيذ</span>
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 whitespace-nowrap sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(taskId)}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="hidden md:inline">حذف</span>
          </Button>
        )}
      </div>
    </div>
  );
};
