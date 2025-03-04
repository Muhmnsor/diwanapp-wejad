
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
    // We don't need to manually refresh the page or refetch data since
    // the real-time subscription in useIdeaStatusUpdater will handle updates
  };
  
  return <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-purple-100 my-[7px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-purple-800 truncate">{title}</h1>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <IdeaCountdown discussion_period={discussion_period} created_at={created_at} ideaId={id} />
          <ExtendButton onClick={handleExtendDialogOpen} />
          <StatusBadge 
            status={status} 
            ideaId={id} 
            discussionPeriod={discussion_period}
            createdAt={created_at}
          />
        </div>
      </div>
      
      <ExtendDiscussionDialog 
        isOpen={isExtendDialogOpen} 
        onClose={handleExtendDialogClose} 
        ideaId={id} 
        onSuccess={handleExtendSuccess} 
      />
    </div>;
};
