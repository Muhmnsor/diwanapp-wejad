
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestActionButtonsProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  canApprove: boolean;
}

export const RequestActionButtons = ({ 
  status, 
  onApprove, 
  onReject, 
  onClose,
  canApprove 
}: RequestActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      {canApprove && (status === 'pending' || status === 'in_progress') ? (
        <>
          <Button variant="outline" onClick={onReject} className="bg-red-50 text-red-600 hover:bg-red-100">
            <X className="mr-2 h-4 w-4" />
            رفض الطلب
          </Button>
          <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            الموافقة على الطلب
          </Button>
        </>
      ) : null}
      <Button variant="outline" onClick={onClose}>
        إغلاق
      </Button>
    </div>
  );
};
