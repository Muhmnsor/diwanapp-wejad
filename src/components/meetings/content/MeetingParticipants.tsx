
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, UserPlus, Mail, User, CheckCircle, XCircle, AlertCircle, Trash } from 'lucide-react';
import { AddParticipantDialog } from '../participants/AddParticipantDialog';
import { ParticipantRole } from '@/types/meeting';
import { MeetingParticipantRoleBadge } from '../participants/MeetingParticipantRoleBadge';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { DeleteDialog } from '@/components/ui/delete-dialog';

interface MeetingParticipantsProps {
  meetingId: string;
}

export const MeetingParticipants: React.FC<MeetingParticipantsProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error, refetch } = useMeetingParticipants(meetingId);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState<string>('');
  
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();

  const handleAddParticipantSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (participantId: string, participantName: string) => {
    setSelectedParticipantId(participantId);
    setSelectedParticipantName(participantName);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedParticipantId) {
      deleteParticipant(selectedParticipantId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          refetch();
        }
      });
    }
  };

  // Function to render the appropriate badge for the attendance status
  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> مؤكد
          </Badge>
        );
      case 'attended':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" /> حضر
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" /> غائب
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" /> معلق
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching meeting participants:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل المشاركين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>المشاركون ({participants?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            إضافة مشارك
          </Button>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">لا يوجد مشاركون في هذا الاجتماع</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setIsAddParticipantOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                إضافة مشارك
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant) => (
                <div key={participant.id} className="border rounded-md p-3 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">
                        {participant.user_display_name || 'مشارك'}
                      </h4>
                      <div className="flex items-center text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {participant.user_email}
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
                      {renderAttendanceStatus(participant.attendance_status)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteClick(participant.id, participant.user_display_name || 'مشارك')}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddParticipantDialog
        open={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        meetingId={meetingId}
        onSuccess={handleAddParticipantSuccess}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="حذف مشارك"
        description={`هل أنت متأكد من رغبتك في حذف "${selectedParticipantName}" من المشاركين؟ لا يمكن التراجع عن هذا الإجراء.`}
        onDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};
