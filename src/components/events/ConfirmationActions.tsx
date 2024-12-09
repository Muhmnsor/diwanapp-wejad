import { Button } from "@/components/ui/button";
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

interface ConfirmationActionsProps {
  onSave: () => void;
  onClose: () => void;
  onPayment?: () => void;
  showPayment: boolean;
}

export const ConfirmationActions = ({
  onSave,
  onClose,
  onPayment,
  showPayment,
}: ConfirmationActionsProps) => {
  const [showCloseAlert, setShowCloseAlert] = useState(false);

  const handleClose = () => {
    setShowCloseAlert(true);
  };

  return (
    <>
      <div className="flex gap-2 mt-4">
        <Button onClick={onSave} className="flex-1">
          حفظ التأكيد
        </Button>
        {showPayment && (
          <Button onClick={onPayment} variant="secondary" className="flex-1">
            الانتقال للدفع
          </Button>
        )}
        <Button onClick={handleClose} variant="outline" className="flex-1">
          إغلاق
        </Button>
      </div>

      <AlertDialog open={showCloseAlert} onOpenChange={setShowCloseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الإغلاق؟</AlertDialogTitle>
            <AlertDialogDescription>
              الرجاء التأكد من حفظ تأكيد التسجيل قبل الإغلاق
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseAlert(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>تأكيد الإغلاق</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};