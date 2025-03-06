
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskProjectDialogContentProps {
  projectTitle: string;
  isDraft?: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export const DeleteTaskProjectDialogContent = ({
  projectTitle,
  isDraft = false,
  isDeleting,
  onClose,
  onDelete,
}: DeleteTaskProjectDialogContentProps) => {
  return (
    <DialogContent className="sm:max-w-[450px]" dir="rtl">
      <DialogHeader className="flex flex-col items-center gap-2">
        <div className="p-3 rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <DialogTitle>تأكيد حذف المشروع</DialogTitle>
        <DialogDescription className="text-center">
          هل أنت متأكد من رغبتك في حذف مشروع "{projectTitle}"؟ 
          {isDraft ? " (مسودة)" : ""}
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-6 sm:justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isDeleting}
        >
          إلغاء
        </Button>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "جارٍ الحذف..." : "حذف المشروع"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
