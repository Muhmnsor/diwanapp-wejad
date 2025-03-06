
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  expenseId: string;
  description: string;
}

export const DeleteExpenseDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  expenseId,
  description,
}: DeleteExpenseDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl" className="font-kufi">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            تأكيد حذف المصروف
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-right">
            <p>هل أنت متأكد من حذف المصروف "{description}"؟</p>
            <p className="text-destructive mt-4">
              هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row-reverse">
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
