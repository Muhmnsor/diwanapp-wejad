import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex gap-2 mt-4">
      <Button onClick={onSave} className="flex-1">
        حفظ التأكيد
      </Button>
      {showPayment && (
        <Button onClick={onPayment} variant="secondary" className="flex-1">
          الانتقال للدفع
        </Button>
      )}
      <Button onClick={onClose} variant="outline" className="flex-1">
        إغلاق
      </Button>
    </div>
  );
};