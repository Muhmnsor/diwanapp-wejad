
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EndDiscussionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const EndDiscussionConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: EndDiscussionConfirmationProps) => {
  // منع إغلاق الحوار أثناء المعالجة
  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting && !open) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد إنهاء المناقشة</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في إنهاء المناقشة؟ هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-between">
          <AlertDialogCancel disabled={isSubmitting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
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
