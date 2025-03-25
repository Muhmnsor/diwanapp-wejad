
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddParticipantDialog } from './AddParticipantDialog';

interface ParticipantDialogBridgeProps {
  meetingId: string;
  onSuccess?: () => void;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

/**
 * A bridge component that provides a button to open the AddParticipantDialog
 * This component is designed to work with the MeetingParticipantsTab without modifying it
 */
export const ParticipantDialogBridge: React.FC<ParticipantDialogBridgeProps> = ({
  meetingId,
  onSuccess,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  className,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize} 
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children || (
          <>
            <UserPlus className="h-4 w-4 mr-1" />
            إضافة مشارك
          </>
        )}
      </Button>
      
      <AddParticipantDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        meetingId={meetingId}
        onSuccess={handleSuccess}
      />
    </>
  );
};
