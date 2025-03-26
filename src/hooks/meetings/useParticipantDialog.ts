
import { useState } from 'react';
import { useAddMeetingParticipant } from './useAddMeetingParticipant';
import { useMeetingParticipants } from './useMeetingParticipants';
import { ParticipantRole, AttendanceStatus } from '@/types/meeting';
import { toast } from 'sonner';

interface UseParticipantDialogOptions {
  meetingId: string;
  onSuccess?: () => void;
}

export const useParticipantDialog = ({ meetingId, onSuccess }: UseParticipantDialogOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refetch } = useMeetingParticipants(meetingId);
  const { mutate: addParticipant, isPending } = useAddMeetingParticipant();

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const handleAddParticipant = (participantData: {
    user_email: string;
    user_display_name: string;
    role: ParticipantRole;
    title?: string;
    phone?: string;
  }) => {
    if (!participantData.user_email || !participantData.user_display_name || !participantData.role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من صحة رقم الجوال إذا تم إدخاله
    if (participantData.phone && !/^05\d{8}$/.test(participantData.phone)) {
      toast.error('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      return;
    }
    
    addParticipant({
      meetingId,
      participant: {
        ...participantData,
        attendance_status: 'pending' as AttendanceStatus,
      }
    }, {
      onSuccess: () => {
        closeDialog();
        refetch();
        if (onSuccess) onSuccess();
        toast.success('تمت إضافة المشارك بنجاح');
      },
      onError: (error) => {
        console.error('Error adding participant:', error);
        toast.error('حدث خطأ أثناء إضافة المشارك');
      }
    });
  };

  return {
    isOpen,
    isPending,
    openDialog,
    closeDialog,
    handleAddParticipant
  };
};
