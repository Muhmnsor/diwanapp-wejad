
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExtendDiscussionDialogProps } from "./types";
import { useIdeaDiscussionData } from "./hooks/useIdeaDiscussionData";
import { useDiscussionSubmit } from "./hooks/useDiscussionSubmit";
import { DiscussionStatusDisplay } from "./components/DiscussionStatusDisplay";
import { DiscussionPeriodForm } from "./components/DiscussionPeriodForm";

export const ExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
}: ExtendDiscussionDialogProps) => {
  const { discussionData, isLoading, formData, setFormData } = useIdeaDiscussionData(ideaId, isOpen);
  
  const { 
    isSubmitting, 
    isEndDialogOpen, 
    setIsEndDialogOpen, 
    handleSubmit, 
    handleEndDiscussion 
  } = useDiscussionSubmit(ideaId, discussionData, onSuccess, onClose);
  
  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
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
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                {/* عرض الوقت الحالي والمتبقي */}
                <DiscussionStatusDisplay discussionData={discussionData} />
                
                {/* نموذج تعديل فترة المناقشة */}
                <DiscussionPeriodForm 
                  formData={formData} 
                  onFormChange={handleFormChange} 
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
                  disabled={isSubmitting || (formData.days === 0 && formData.hours === 0)}
                >
                  {isSubmitting ? "جاري التعديل..." : formData.operation === "add" ? "تمديد" : "تنقيص"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد إنهاء المناقشة */}
      <AlertDialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إنهاء المناقشة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إنهاء المناقشة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-between">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndDiscussion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإنهاء..." : "إنهاء المناقشة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
