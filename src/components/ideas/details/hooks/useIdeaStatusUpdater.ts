
import { useState, useEffect } from "react";
import { fetchIdeaStatus, updateIdeaStatus } from "../services/ideaStatusService";
import { useRealtimeStatus } from "./useRealtimeStatus";
import { useDiscussionStatusChecker } from "./useDiscussionStatusChecker";
import { showStatusNotification } from "../utils/statusNotifications";

interface UseIdeaStatusUpdaterProps {
  ideaId?: string;
  initialStatus: string;
  discussionPeriod?: string;
  createdAt?: string;
}

export const useIdeaStatusUpdater = ({
  ideaId,
  initialStatus,
  discussionPeriod,
  createdAt
}: UseIdeaStatusUpdaterProps) => {
  const [lastStatusUpdate, setLastStatusUpdate] = useState<number>(Date.now());
  
  const handleStatusChange = (newStatus: string) => {
    setLastStatusUpdate(Date.now());
  };

  // Initialize real-time status updates
  const { status, setStatus } = useRealtimeStatus({
    ideaId,
    initialStatus,
    onStatusChange: handleStatusChange
  });
  
  // Initialize discussion status checker
  const { isProcessingStatusChange } = useDiscussionStatusChecker({
    ideaId,
    status,
    discussionPeriod,
    createdAt,
    lastStatusUpdate,
    onStatusChange: (newStatus) => {
      setStatus(newStatus);
      setLastStatusUpdate(Date.now());
    }
  });

  // جلب حالة الفكرة من قاعدة البيانات عند التحميل الأولي
  useEffect(() => {
    if (!ideaId) return;
    
    console.log("🏁 بدء تحميل مكون StatusBadge مع الحالة الأولية:", initialStatus);
    
    const getInitialStatus = async () => {
      const data = await fetchIdeaStatus(ideaId);
      
      if (data && data.status !== status) {
        console.log(`🔄 تحديث حالة الفكرة في واجهة المستخدم من "${status}" إلى "${data.status}"`);
        setStatus(data.status);
        setLastStatusUpdate(Date.now());
        
        // عرض إشعار عند تغيير الحالة
        showStatusNotification(data.status);
      }
    };
    
    getInitialStatus();
  }, [ideaId, initialStatus]);

  // تحديث حالة الفكرة في قاعدة البيانات
  const handleUpdateIdeaStatus = async (newStatus: string) => {
    if (newStatus === status) {
      console.log(`⏩ تجاهل التحديث: الحالة الجديدة "${newStatus}" مطابقة للحالة الحالية`);
      return;
    }

    const success = await updateIdeaStatus(ideaId, newStatus);
    
    if (success) {
      setStatus(newStatus);
      setLastStatusUpdate(Date.now());
    }
  };

  return {
    status,
    updateIdeaStatus: handleUpdateIdeaStatus,
    isProcessingStatusChange
  };
};
