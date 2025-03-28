
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Mail, Phone, Briefcase, Trash, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ParticipantDialogBridge } from '../participants/ParticipantDialogBridge';
import { ParticipantRole, AttendanceStatus } from '@/types/meeting';
import { MeetingParticipantRoleBadge } from '../participants/MeetingParticipantRoleBadge';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useUpdateParticipantAttendance } from '@/hooks/meetings/useUpdateParticipantAttendance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MeetingParticipantsProps {
  meetingId: string;
}

export const MeetingParticipants: React.FC<MeetingParticipantsProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error, refetch } = useMeetingParticipants(meetingId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState<string>('');
  
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();
  const { mutate: updateAttendance, isPending: isUpdatingAttendance } = useUpdateParticipantAttendance();

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

  const handleAttendanceUpdate = (participantId: string, status: AttendanceStatus) => {
    updateAttendance({ participantId, attendanceStatus: status });
  };

  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
            <AlertCircle className="w-3 h-3" /> مؤكد
          </span>
        );
      case 'attended':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
            <CheckCircle className="w-3 h-3" /> حضر
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
            <XCircle className="w-3 h-3" /> غائب
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
            <AlertCircle className="w-3 h-3" /> معلق
          </span>
        );
    }
  };

  const renderAttendanceActions = (participant: any) => {
    return (
      <div className="flex space-x-2 space-x-reverse">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
          onClick={() => handleAttendanceUpdate(participant.id, 'attended')}
          disabled={isUpdatingAttendance}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          حضر
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          onClick={() => handleAttendanceUpdate(participant.id, 'absent')}
          disabled={isUpdatingAttendance}
        >
          <XCircle className="h-4 w-4 mr-1" />
          غائب
        </Button>
      </div>
    );
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
          <ParticipantDialogBridge
            meetingId={meetingId}
            onSuccess={handleAddParticipantSuccess}
            buttonVariant="outline"
          >
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </ParticipantDialogBridge>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">لا يوجد مشاركون في هذا الاجتماع</p>
              <ParticipantDialogBridge
                meetingId={meetingId}
                onSuccess={handleAddParticipantSuccess}
                buttonVariant="outline"
                className="mt-4"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة مشارك
              </ParticipantDialogBridge>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المشارك</TableHead>
                    <TableHead>معلومات التواصل</TableHead>
                    <TableHead>المنصب</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>حالة الحضور</TableHead>
                    <TableHead>التحضير</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        {participant.user_display_name || 'مشارك'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {participant.user_email}
                          </div>
                          {participant.phone && (
                            <div className="flex items-center text-gray-500 text-sm">
                              <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              {participant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {participant.title ? (
                          <div className="flex items-center text-gray-700">
                            <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {participant.title}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
                      </TableCell>
                      <TableCell>
                        {renderAttendanceStatus(participant.attendance_status)}
                      </TableCell>
                      <TableCell>
                        {renderAttendanceActions(participant)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteClick(participant.id, participant.user_display_name || 'مشارك')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
