
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
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface EventDeleteDialogProps {
  eventId: string;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  title?: string;
}

export const EventDeleteDialog = ({
  eventId,
  onOpenChange,
  isOpen,
  onConfirm,
  title,
}: EventDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error during deletion:', error);
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            تأكيد حذف الفعالية
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>هل أنت متأكد من حذف الفعالية "{title}"؟</p>
            <p className="font-semibold text-destructive">
              سيتم حذف جميع البيانات المرتبطة بهذه الفعالية بما في ذلك:
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>جميع التسجيلات</li>
              <li>سجلات الحضور</li>
              <li>التقييمات والتعليقات</li>
              <li>التقارير</li>
              <li>الإشعارات</li>
            </ul>
            <p className="text-destructive mt-4">
              هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
