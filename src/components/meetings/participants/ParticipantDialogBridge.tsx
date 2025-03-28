
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useParticipantDialog } from '@/hooks/meetings/useParticipantDialog';
import { AddParticipantSheet } from './AddParticipantSheet';

interface ParticipantDialogBridgeProps {
  meetingId: string;
  onSuccess?: () => void;
}

export const ParticipantDialogBridge: React.FC<ParticipantDialogBridgeProps> = ({ 
  meetingId,
  onSuccess = () => {}
}) => {
  const {
    isOpen,
    isPending,
    openDialog,
    closeDialog,
    handleAddParticipant
  } = useParticipantDialog({ 
    meetingId, 
    onSuccess 
  });

  return (
    <>
      <Button onClick={openDialog} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        إضافة مشارك
      </Button>
      
      <AddParticipantSheet
        open={isOpen}
        onOpenChange={closeDialog}
        onSubmit={handleAddParticipant}
        isPending={isPending}
      />
    </>
  );
};
