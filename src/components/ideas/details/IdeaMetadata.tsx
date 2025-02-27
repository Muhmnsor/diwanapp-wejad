
import { useState, useEffect } from "react";
import { IdeaCountdown } from "./components/IdeaCountdown";
import { StatusBadge } from "./components/StatusBadge";
import { ExtendButton } from "./components/ExtendButton";
import { ExtendDiscussionDialog } from "./dialogs/ExtendDiscussionDialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
    toast.success("تم تمديد فترة المناقشة بنجاح");
    
    // تحديث البيانات باستخدام React Query
    // 1. تحديث قائمة الأفكار
    queryClient.invalidateQueries({ queryKey: ['ideas'] });
    
    // 2. تحديث تفاصيل الفكرة الحالية
    queryClient.invalidateQueries({ queryKey: ['idea', id] });
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
