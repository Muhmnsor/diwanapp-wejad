
import { useState, useEffect } from "react";
import { IdeaCountdown } from "./components/IdeaCountdown";
import { StatusBadge } from "./components/StatusBadge";
import { ExtendButton } from "./components/ExtendButton";
import { ExtendDiscussionDialog } from "./dialogs/ExtendDiscussionDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface IdeaMetadataProps {
  id: string;
  created_by: string;
  created_at: string;
  status: string;
  title: string;
  discussion_period?: string;
}

export const IdeaMetadata = ({ 
  id,
  created_by, 
  created_at, 
  status, 
  title, 
  discussion_period 
}: IdeaMetadataProps) => {
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [updatedPeriod, setUpdatedPeriod] = useState(discussion_period);
  const [updatedCreatedAt, setUpdatedCreatedAt] = useState(created_at);
  const navigate = useNavigate();

  useEffect(() => {
    setUpdatedPeriod(discussion_period);
    setUpdatedCreatedAt(created_at);
  }, [discussion_period, created_at]);

  const handleExtendDialogOpen = () => {
    setIsExtendDialogOpen(true);
  };

  const handleExtendDialogClose = () => {
    setIsExtendDialogOpen(false);
  };

  const handleExtendSuccess = () => {
    // إعادة تحميل الصفحة بعد نجاح التمديد
    toast.success("تم تمديد فترة المناقشة بنجاح - جاري تحديث البيانات");
    
    // الانتظار قليلاً ثم إعادة تحميل الصفحة للحصول على البيانات المحدثة
    setTimeout(() => {
      navigate(0); // استخدام navigate(0) لإعادة تحميل الصفحة الحالية
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-100">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-purple-800 truncate">{title}</h1>
        
        <div className="flex items-center gap-3">
          <IdeaCountdown discussion_period={updatedPeriod} created_at={updatedCreatedAt} />
          <ExtendButton onClick={handleExtendDialogOpen} />
          <StatusBadge status={status} />
        </div>
      </div>
      
      <ExtendDiscussionDialog
        isOpen={isExtendDialogOpen}
        onClose={handleExtendDialogClose}
        ideaId={id}
        onSuccess={handleExtendSuccess}
      />
    </div>
  );
};
