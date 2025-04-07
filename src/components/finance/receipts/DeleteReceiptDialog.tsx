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

interface DeleteReceiptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  receiptId: string;
  receiptNumber: string;
}

export const DeleteReceiptDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  receiptId,
  receiptNumber,
}: DeleteReceiptDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد حذف سند القبض</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف سند القبض رقم {receiptNumber}؟
            <br />
            لا يمكن التراجع عن هذه العملية بعد إتمامها.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse justify-start space-x-reverse space-x-2">
          <AlertDialogCancel className="mb-0">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={onConfirm}
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

