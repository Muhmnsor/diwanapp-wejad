
import { useState } from "react";
import { IdeaCountdown } from "./components/IdeaCountdown";
import { StatusBadge } from "./components/StatusBadge";
import { ExtendButton } from "./components/ExtendButton";
import { ExtendDiscussionDialog } from "./dialogs/ExtendDiscussionDialog";

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

  const handleExtendDialogOpen = () => {
    setIsExtendDialogOpen(true);
  };

  const handleExtendDialogClose = () => {
    setIsExtendDialogOpen(false);
  };

  const handleExtendSuccess = () => {
    // يمكن إضافة أي منطق إضافي هنا بعد نجاح عملية التمديد
    console.log("Discussion period extended successfully");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-100">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-purple-800 truncate">{title}</h1>
        
        <div className="flex items-center gap-3">
          <IdeaCountdown discussion_period={discussion_period} created_at={created_at} />
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
