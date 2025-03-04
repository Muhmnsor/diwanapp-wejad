
import { useEffect, useState } from "react";
import { isDiscussionActive } from "../utils/countdownUtils";
import { updateIdeaStatus } from "../services/ideaStatusService";

interface UseDiscussionStatusCheckerProps {
  ideaId?: string;
  status: string;
  discussionPeriod?: string;
  createdAt?: string;
  lastStatusUpdate: number;
  onStatusChange: (newStatus: string) => void;
}

export const useDiscussionStatusChecker = ({
  ideaId,
  status,
  discussionPeriod,
  createdAt,
  lastStatusUpdate,
  onStatusChange
}: UseDiscussionStatusCheckerProps) => {
  const [isProcessingStatusChange, setIsProcessingStatusChange] = useState(false);

  // التحقق من حالة المناقشة عند تغير البيانات
  useEffect(() => {
    if (!ideaId || !discussionPeriod || !createdAt) return;

    // منع تنفيذ التحقق إذا تم تحديث الحالة مؤخراً (خلال 5 ثوان)
    if (Date.now() - lastStatusUpdate < 5000) {
      console.log("⏱️ تم تحديث الحالة مؤخراً، تجاهل التحقق من حالة المناقشة");
      return;
    }

    if (isProcessingStatusChange) {
      console.log("⏳ جاري معالجة تغيير الحالة بالفعل، تجاهل التحقق الإضافي");
      return;
    }

    const checkDiscussionStatus = async () => {
      try {
        const isActive = isDiscussionActive(discussionPeriod, createdAt);
        console.log(`🔍 التحقق من حالة المناقشة. نشطة: ${isActive}, فترة المناقشة: ${discussionPeriod}`);
        
        setIsProcessingStatusChange(true);
        
        // إذا كانت الفكرة في مرحلة المناقشة (draft/under_review) وانتهت المناقشة
        if (!isActive && (status === 'draft' || status === 'under_review')) {
          console.log("⏰ انتهت المناقشة، تحديث الحالة إلى بانتظار القرار");
          
          const success = await updateIdeaStatus(ideaId, 'pending_decision');
          if (success) {
            onStatusChange('pending_decision');
          }
        } 
        // إذا كانت الفكرة في حالة انتظار القرار وتم تمديد المناقشة (أصبحت نشطة مرة أخرى)
        else if (isActive && status === 'pending_decision') {
          console.log("⏰ تم تمديد فترة المناقشة، تحديث الحالة إلى قيد المناقشة");
          
          const success = await updateIdeaStatus(ideaId, 'under_review');
          if (success) {
            onStatusChange('under_review');
          }
        }
      } finally {
        setIsProcessingStatusChange(false);
      }
    };
    
    // نفذ التحقق عند تحميل المكون أو تغير البيانات
    checkDiscussionStatus();
  }, [discussionPeriod, createdAt, status, ideaId, lastStatusUpdate, onStatusChange]);

  return { isProcessingStatusChange };
};
