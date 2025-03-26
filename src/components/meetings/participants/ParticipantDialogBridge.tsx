
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddParticipantSheet } from './AddParticipantSheet';
import { useParticipantDialog } from '@/hooks/meetings/useParticipantDialog';

interface ParticipantDialogBridgeProps {
  meetingId: string;
  onSuccess?: () => void;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const ParticipantDialogBridge: React.FC<ParticipantDialogBridgeProps> = ({
  meetingId,
  onSuccess,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  className,
  children
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
      <Button 
        variant={buttonVariant} 
        size={buttonSize} 
        onClick={openDialog}
        className={className}
      >
        {children || (
          <>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </>
        )}
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
