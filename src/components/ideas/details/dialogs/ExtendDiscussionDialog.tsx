
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExtendDiscussionForm } from "./hooks/useExtendDiscussionForm";
import { CurrentDiscussionInfo } from "./components/CurrentDiscussionInfo";
import { OperationSelector } from "./components/OperationSelector";
import { TimeInputFields } from "./components/TimeInputFields";
import { EndDiscussionConfirmation } from "./components/EndDiscussionConfirmation";

interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export const ExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
}: ExtendDiscussionDialogProps) => {
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  
  const {
    formState,
    handleDaysChange,
    handleHoursChange,
    handleOperationChange,
    handleSubmit,
    handleEndDiscussion
  } = useExtendDiscussionForm({
    ideaId,
    onSuccess,
    onClose,
    isOpen
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فترة المناقشة</DialogTitle>
          </DialogHeader>
          
          {formState.isLoading ? (
            <div className="py-4 text-center">جاري تحميل البيانات...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* عرض الوقت الحالي والمتبقي */}
                <CurrentDiscussionInfo 
                  totalCurrentHours={formState.totalCurrentHours}
                  remainingDays={formState.remainingDays}
                  remainingHours={formState.remainingHours}
                />
                
                {/* اختيار نوع العملية (تمديد/تنقيص) */}
                <OperationSelector 
                  operation={formState.operation}
                  onOperationChange={handleOperationChange}
                />
              
                {/* حقول إدخال الوقت */}
                <TimeInputFields 
                  days={formState.days}
                  hours={formState.hours}
                  onDaysChange={handleDaysChange}
                  onHoursChange={handleHoursChange}
                />
              </div>
              
              <DialogFooter className="sm:justify-between mt-6 flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={formState.isSubmitting}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsEndDialogOpen(true)} 
                    disabled={formState.isSubmitting}
                  >
                    إنهاء المناقشة
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={formState.isSubmitting || (formState.days === 0 && formState.hours === 0)}
                >
                  {formState.isSubmitting ? "جاري التعديل..." : formState.operation === "add" ? "تمديد" : "تنقيص"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد إنهاء المناقشة */}
      <EndDiscussionConfirmation
        open={isEndDialogOpen}
        onOpenChange={setIsEndDialogOpen}
        onConfirm={handleEndDiscussion}
        isSubmitting={formState.isSubmitting}
      />
    </>
  );
};
