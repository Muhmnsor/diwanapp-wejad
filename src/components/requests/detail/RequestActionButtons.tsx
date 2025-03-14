
import { Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestActionButtonsProps {
  status: string;
  isCurrentApprover: boolean;
  stepType?: string;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const RequestActionButtons = ({ 
  status, 
  isCurrentApprover,
  stepType = "decision",
  onApprove, 
  onReject, 
  onClose 
}: RequestActionButtonsProps) => {
  // Show approve/reject buttons if:
  // 1. Status is 'pending' or 'in_progress' 
  // 2. AND user is current approver OR it's an opinion step and user is allowed to participate
  const showActionButtons = (status === 'pending' || status === 'in_progress') && isCurrentApprover;
  
  const isOpinion = stepType === 'opinion';
  
  return (
    <div className="flex gap-2">
      {showActionButtons ? (
        <>
          <Button 
            variant="outline" 
            onClick={onReject} 
            className={isOpinion 
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" 
              : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            }
          >
            {isOpinion ? (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                رأي سلبي
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                رفض الطلب
              </>
            )}
          </Button>
          <Button 
            onClick={onApprove} 
            className={isOpinion 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-green-600 hover:bg-green-700"
            }
          >
            {isOpinion ? (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                رأي إيجابي
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                الموافقة على الطلب
              </>
            )}
          </Button>
        </>
      ) : null}
      <Button variant="outline" onClick={onClose}>
        إغلاق
      </Button>
    </div>
  );
};
