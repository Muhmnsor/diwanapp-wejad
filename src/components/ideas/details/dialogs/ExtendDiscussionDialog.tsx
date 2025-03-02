
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EndDiscussionConfirmation } from "./EndDiscussionConfirmation";
import { DiscussionPeriodInputs } from "./components/DiscussionPeriodInputs";
import { useDiscussionPeriod } from "./hooks/useDiscussionPeriod";
import { useDiscussionSubmit } from "./hooks/useDiscussionSubmit";
import { ExtendDiscussionDialogProps } from "./types";

export const ExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
}: ExtendDiscussionDialogProps) => {
  // استخدام الـ custom hooks
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
    totalCurrentHours
  } = useDiscussionPeriod(isOpen, ideaId);

  const {
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  } = useDiscussionSubmit();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      ideaId,
      days,
      hours,
      operation,
      totalCurrentHours,
      remainingDays,
      remainingHours,
      onSuccess,
      onClose
    });
  };

  const onEndDiscussion = () => {
    handleEndDiscussion(ideaId, onSuccess, onClose);
  };

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
            <form onSubmit={onSubmit}>
              <DiscussionPeriodInputs
                days={days}
                setDays={setDays}
                hours={hours}
                setHours={setHours}
                operation={operation}
                setOperation={setOperation}
                totalCurrentHours={totalCurrentHours}
                remainingDays={remainingDays}
                remainingHours={remainingHours}
              />
              
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
      <EndDiscussionConfirmation
        isOpen={isEndDialogOpen}
        onClose={() => setIsEndDialogOpen(false)}
        onConfirm={onEndDiscussion}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
