
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
    
    // تجنب التنفيذ المتكرر إذا كانت العملية جارية بالفعل
    if (isSubmitting) return;
    
    try {
      // تنفيذ الإجراء الذي تم تمريره من الأعلى
      await onConfirm();
      // لا نغلق النافذة هنا لأن onConfirm ستتولى ذلك
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      // في حالة الخطأ، قد نرغب في السماح للمستخدم بالمحاولة مرة أخرى
      // لذلك لا نغلق النافذة تلقائيًا
    }
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
