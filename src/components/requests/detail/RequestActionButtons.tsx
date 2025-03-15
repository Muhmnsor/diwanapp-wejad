
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestActionButtonsProps {
  status: string;
  isCurrentApprover: boolean;
  stepType?: string;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  hasSubmittedOpinion?: boolean;
}

export const RequestActionButtons = ({ 
  status, 
  isCurrentApprover,
  stepType = "decision",
  onApprove, 
  onReject, 
  onClose,
  hasSubmittedOpinion = false
}: RequestActionButtonsProps) => {
  // SECURITY ENHANCEMENT: Only show approve/reject buttons if:
  // 1. Status is 'pending' or 'in_progress' 
  // 2. AND user is STRICTLY designated as the current approver
  // 3. For opinion steps: user hasn't already submitted an opinion
  // 4. For decision steps: always respect approver designation
  const showActionButtons = (status === 'pending' || status === 'in_progress') && 
                           isCurrentApprover &&
                           (stepType !== 'opinion' || !hasSubmittedOpinion);
  
  return (
    <div className="flex gap-2">
      {showActionButtons ? (
        <>
          <Button variant="outline" onClick={onReject} className="bg-red-50 text-red-600 hover:bg-red-100">
            <X className="mr-2 h-4 w-4" />
            {stepType === 'opinion' ? 'رأي سلبي' : 'رفض الطلب'}
          </Button>
          <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            {stepType === 'opinion' ? 'رأي إيجابي' : 'الموافقة على الطلب'}
          </Button>
        </>
      ) : null}
      <Button variant="outline" onClick={onClose}>
        إغلاق
      </Button>
    </div>
  );
};
