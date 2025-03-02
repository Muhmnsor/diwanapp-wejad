
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface EndDiscussionConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export const EndDiscussionConfirmation = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isSubmitting
}: EndDiscussionConfirmationProps) => {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // تجنب الإغلاق التلقائي قبل اكتمال العملية
    if (isSubmitting) return;
    
    // تنفيذ إجراء التأكيد
    await onConfirm();
    
    // عدم إغلاق النافذة هنا، دع الوظيفة onConfirm تتحكم في الإغلاق
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإنهاء..." : "إنهاء المناقشة"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
