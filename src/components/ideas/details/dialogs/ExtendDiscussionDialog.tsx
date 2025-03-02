
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExtendDiscussion } from "./useExtendDiscussion";
import { EndDiscussionConfirmDialog } from "./EndDiscussionConfirmDialog";
import { CurrentDiscussionTime } from "./CurrentDiscussionTime";
import { OperationSelector } from "./OperationSelector";
import { TimeInputFields } from "./TimeInputFields";
import { ExtendDiscussionDialogProps } from "./types";

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
    totalCurrentHours,
    operation,
    setOperation,
    isLoading,
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  } = useExtendDiscussion(isOpen, ideaId, onSuccess, onClose);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فترة المناقشة</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-4 text-center">جاري تحميل البيانات...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* عرض الوقت الحالي والمتبقي */}
                <CurrentDiscussionTime 
                  totalCurrentHours={totalCurrentHours}
                  remainingDays={remainingDays}
                  remainingHours={remainingHours}
                />
                
                {/* اختيار نوع العملية (تمديد/تنقيص) */}
                <OperationSelector
                  operation={operation}
                  onOperationChange={setOperation}
                />
              
                {/* حقول إدخال الوقت */}
                <TimeInputFields
                  days={days}
                  hours={hours}
                  onDaysChange={setDays}
                  onHoursChange={setHours}
                />
              </div>
              
              <DialogFooter className="sm:justify-between mt-6 flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsEndDialogOpen(true)} 
                    disabled={isSubmitting}
                  >
                    إنهاء المناقشة
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (days === 0 && hours === 0)}
                >
                  {isSubmitting ? "جاري التعديل..." : operation === "add" ? "تمديد" : "تنقيص"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد إنهاء المناقشة */}
      <EndDiscussionConfirmDialog
        isOpen={isEndDialogOpen}
        onOpenChange={setIsEndDialogOpen}
        onConfirm={handleEndDiscussion}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
