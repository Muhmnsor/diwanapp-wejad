
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyProgressIndicator } from "./components/CopyProgressIndicator";
import { CopyProjectFields } from "./components/CopyProjectFields";
import { useCopyProject } from "./hooks/useCopyProject";

interface CopyProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSuccess: () => void;
}

export const CopyProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSuccess,
}: CopyProjectDialogProps) => {
  const [newTitle, setNewTitle] = useState(`نسخة من ${projectTitle}`);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeStages, setIncludeStages] = useState(true);

  const {
    isLoading,
    copyProgress,
    copyStep,
    isComplete,
    error,
    handleCopy,
    resetState
  } = useCopyProject({
    projectId,
    newTitle,
    includeTasks,
    includeAttachments,
    includeStages,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  const handleClose = () => {
    if (!isLoading) {
      resetState();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>نسخ المشروع كمسودة</DialogTitle>
          <DialogDescription>
            سيتم إنشاء نسخة جديدة من المشروع بوضع المسودة حتى تتمكن من تعديلها قبل إطلاقها.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CopyProgressIndicator
          progress={copyProgress}
          step={copyStep}
          isLoading={isLoading}
        />

        <CopyProjectFields
          newTitle={newTitle}
          onTitleChange={setNewTitle}
          includeStages={includeStages}
          onIncludeStagesChange={setIncludeStages}
          includeTasks={includeTasks}
          onIncludeTasksChange={setIncludeTasks}
          includeAttachments={includeAttachments}
          onIncludeAttachmentsChange={setIncludeAttachments}
          isLoading={isLoading}
        />

        <DialogFooter className="flex-row-reverse gap-2">
          <Button 
            onClick={handleCopy} 
            disabled={isLoading}
            className={isComplete ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isComplete ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> تم النسخ بنجاح
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري النسخ...
              </>
            ) : (
              "نسخ المشروع"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
