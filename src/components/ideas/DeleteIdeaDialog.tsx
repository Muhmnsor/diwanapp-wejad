
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

interface DeleteIdeaDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteIdeaDialog = ({
  isOpen,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteIdeaDialogProps) => {
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && !isDeleting) onOpenChange(false);
      }}
    >
      <AlertDialogContent className="font-kufi" dir="rtl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-right">
            هل أنت متأكد من حذف هذه الفكرة؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            سيتم حذف الفكرة نهائياً ولا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row-reverse sm:space-x-reverse space-x-reverse gap-2">
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
