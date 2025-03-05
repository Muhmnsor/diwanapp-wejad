
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AttachmentsByCategory } from "../../components/metadata/AttachmentsByCategory";
import { useTaskMetadataAttachments } from "../../hooks/useTaskMetadataAttachments";

interface TaskAttachmentButtonProps {
  taskId: string;
}

export const TaskAttachmentButton = ({ taskId }: TaskAttachmentButtonProps) => {
  const [open, setOpen] = useState(false);
  const {
    loading,
    creatorAttachments,
    assigneeAttachments,
    commentAttachments,
    handleDownload
  } = useTaskMetadataAttachments(taskId);

  const totalAttachments = 
    (creatorAttachments?.length || 0) + 
    (assigneeAttachments?.length || 0) + 
    (commentAttachments?.length || 0);

  if (totalAttachments === 0) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs"
      >
        <Paperclip className="h-3.5 w-3.5" />
        <span>{totalAttachments}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>مرفقات المهمة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
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
        </DialogContent>
      </Dialog>
    </>
  );
};
