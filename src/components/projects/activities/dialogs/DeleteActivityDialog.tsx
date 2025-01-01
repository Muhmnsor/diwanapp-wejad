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

interface DeleteActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteActivityDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteActivityDialogProps) => {
  console.log("DeleteActivityDialog - isOpen:", isOpen);
  
  const handleConfirm = () => {
    console.log("Delete confirmation clicked");
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا النشاط؟</AlertDialogTitle>
          <AlertDialogDescription>
            لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>حذف</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};