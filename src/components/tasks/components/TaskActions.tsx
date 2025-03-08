
import { Button } from "@/components/ui/button";
import { MessageCircle, Upload, Paperclip, FileDown, Pencil, Check, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TaskActionsProps {
  currentStatus: string;
  isUpdating: boolean;
  onShowDiscussion: () => void;
  onOpenFileUploader: () => void;
  onOpenAttachments: () => void;
  onOpenTemplates: () => void;
  onStatusChange: (status: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  taskId: string;
  isGeneral?: boolean;
  canEdit: boolean;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  currentStatus,
  isUpdating,
  onShowDiscussion,
  onOpenFileUploader,
  onOpenAttachments,
  onOpenTemplates,
  onStatusChange,
  onDelete,
  onEdit,
  taskId,
  isGeneral,
  canEdit,
}) => {
  const handleStatusChange = (status: string) => {
    if (!canEdit) {
      toast.error("لا يمكنك تغيير حالة المهمة لأنك لست المكلف بها أو لا تملك الصلاحية");
      return;
    }
    onStatusChange(status);
  };

  const handleEdit = (taskId: string) => {
    if (!canEdit) {
      toast.error("لا يمكنك تعديل المهمة لأنك لست المكلف بها أو لا تملك الصلاحية");
      return;
    }
    if (onEdit) {
      onEdit(taskId);
    }
  };

  const handleDelete = (taskId: string) => {
    if (!canEdit) {
      toast.error("لا يمكنك حذف المهمة لأنك لست المكلف بها أو لا تملك الصلاحية");
      return;
    }
    if (onDelete) {
      onDelete(taskId);
    }
  };

  return (
    <div className="flex justify-between items-center mt-3 pt-3 border-t">
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onShowDiscussion}
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
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onOpenAttachments}
        >
          <Paperclip className="h-3.5 w-3.5" />
          المستلمات
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onOpenTemplates}
        >
          <FileDown className="h-3.5 w-3.5" />
          نماذج المهمة
        </Button>
      </div>
      
      <div className="flex gap-2">
        {/* Edit button for general tasks */}
        {isGeneral && onEdit && canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => handleEdit(taskId)}
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500" />
            تعديل
          </Button>
        )}
        
        {/* Status change buttons */}
        {canEdit && (
          currentStatus !== "completed" ? (
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
          )
        )}
        
        {onDelete && canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(taskId)}
          >
            <XCircle className="h-3.5 w-3.5" />
            حذف
          </Button>
        )}
        
        {!canEdit && (
          <div className="text-xs italic text-gray-400 px-2">
            مقيد الصلاحيات
          </div>
        )}
      </div>
    </div>
  );
};
