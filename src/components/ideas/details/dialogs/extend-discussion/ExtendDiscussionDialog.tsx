
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExtendDiscussionDialogProps } from "./types";
import { useDiscussionData } from "./useDiscussionData";
import { useDiscussionSubmit } from "./useDiscussionSubmit";
import { DiscussionForm } from "./DiscussionForm";
import { EndDiscussionConfirmation } from "./EndDiscussionConfirmation";
import { useEffect } from "react";

export const ExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
}: ExtendDiscussionDialogProps) => {
  const {
    days,
    setDays,
    hours,
    setHours,
    remainingDays,
    remainingHours,
    isLoading,
    operation,
    setOperation,
    totalCurrentHours,
    isEndDialogOpen,
    setIsEndDialogOpen
  } = useDiscussionData(ideaId, isOpen);

  const {
    isSubmitting,
    handleSubmit,
    handleEndDiscussion
  } = useDiscussionSubmit(ideaId, onSuccess, onClose);
  
  // إغلاق حوار إنهاء المناقشة عند إغلاق الحوار الرئيسي
  useEffect(() => {
    if (!isOpen) {
      setIsEndDialogOpen(false);
    }
  }, [isOpen, setIsEndDialogOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    return handleSubmit(
      e,
      days,
      hours,
      operation,
      totalCurrentHours,
      remainingDays,
      remainingHours
    );
  };
  
  const handleEndDialogClose = (open: boolean) => {
    if (!isSubmitting) {
      setIsEndDialogOpen(open);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فترة المناقشة</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-4 text-center">جاري تحميل البيانات...</div>
          ) : (
            <DiscussionForm
              timeData={{
                days,
                hours,
                totalCurrentHours,
                remainingDays,
                remainingHours
              }}
              operation={operation}
              setOperation={setOperation}
              setDays={setDays}
              setHours={setHours}
              isSubmitting={isSubmitting}
              onSubmit={handleFormSubmit}
              onClose={onClose}
              onOpenEndDialog={() => setIsEndDialogOpen(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <EndDiscussionConfirmation
        isOpen={isEndDialogOpen}
        onOpenChange={handleEndDialogClose}
        onConfirm={handleEndDiscussion}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
