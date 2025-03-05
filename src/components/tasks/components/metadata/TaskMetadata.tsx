
import { useTaskMetadataAttachments } from "../../hooks/useTaskMetadataAttachments";
import { BasicMetadata } from "./BasicMetadata";
import { AttachmentsByCategory } from "./AttachmentsByCategory";

interface TaskMetadataProps {
  dueDate?: string | null;
  projectName?: string | null;
  isSubtask: boolean;
  parentTaskId?: string | null;
  taskId?: string | null;
  showFileUploadButton?: boolean;
  onFileUpload?: () => void;
}

export const TaskMetadata = ({ 
  dueDate, 
  projectName, 
  isSubtask, 
  parentTaskId, 
  taskId,
  showFileUploadButton,
  onFileUpload
}: TaskMetadataProps) => {
  const {
    loading,
    creatorAttachments,
    assigneeAttachments,
    commentAttachments,
    handleDownload
  } = useTaskMetadataAttachments(taskId || undefined);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <BasicMetadata 
        dueDate={dueDate}
        projectName={projectName}
        isSubtask={isSubtask}
        parentTaskId={parentTaskId}
        showFileUploadButton={showFileUploadButton}
        onFileUpload={onFileUpload}
      />

      <AttachmentsByCategory
        title="مرفقات منشئ المهمة:"
        attachments={creatorAttachments}
        bgColor="bg-blue-50"
        iconColor="text-blue-500"
        onDownload={handleDownload}
      />

      <AttachmentsByCategory
        title="مرفقات المكلف بالمهمة:"
        attachments={assigneeAttachments}
        bgColor="bg-green-50"
        iconColor="text-green-500"
        onDownload={handleDownload}
      />

      <AttachmentsByCategory
        title="مرفقات التعليقات:"
        attachments={commentAttachments}
        bgColor="bg-gray-50"
        iconColor="text-gray-500"
        onDownload={handleDownload}
      />
    </div>
  );
};
