
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Request } from "@/features/requests/types/request.types";

interface DetailsHeaderProps {
  request: Request;
  isCurrentApprover: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const DetailsHeader = ({ 
  request, 
  isCurrentApprover,
  onApprove, 
  onReject, 
  onClose 
}: DetailsHeaderProps) => {
  // Only show approve/reject buttons if status is 'pending' or 'in_progress' AND user is the current approver
  const showActionButtons = (request.status === 'pending' || request.status === 'in_progress') && isCurrentApprover;
  
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
      
      <div className="flex gap-2">
        {showActionButtons ? (
          <>
            <Button 
              variant="outline" 
              onClick={onReject} 
              className="bg-red-50 text-red-600 hover:bg-red-100"
            >
              <X className="ml-2 h-4 w-4" />
              رفض الطلب
            </Button>
            <Button 
              onClick={onApprove} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="ml-2 h-4 w-4" />
              الموافقة على الطلب
            </Button>
          </>
        ) : null}
        <Button variant="outline" onClick={onClose}>
          إغلاق
        </Button>
      </div>
    </div>
  );
};
