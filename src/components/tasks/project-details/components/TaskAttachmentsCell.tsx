
import { Paperclip } from "lucide-react";
import { useTaskMetadataAttachments } from "../../hooks/useTaskMetadataAttachments";

export const TaskAttachmentsCell = ({ taskId }: { taskId: string }) => {
  const { assigneeAttachments, loading } = useTaskMetadataAttachments(taskId);
  
  if (loading) {
    return <span className="text-gray-400">جاري التحميل...</span>;
  }
  
  if (!assigneeAttachments || assigneeAttachments.length === 0) {
    return <span className="text-gray-400">لا توجد مستلزمات</span>;
  }
  
  return (
    <div className="flex items-center gap-1">
      <Paperclip className="h-4 w-4 text-blue-500" />
      <span>{assigneeAttachments.length}</span>
    </div>
  );
};
