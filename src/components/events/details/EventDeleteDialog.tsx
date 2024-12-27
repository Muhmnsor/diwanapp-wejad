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

interface EventDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const EventDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: EventDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذه الفعالية؟</AlertDialogTitle>
          <AlertDialogDescription>
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات المتعلقة بهذه الفعالية.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};