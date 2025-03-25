
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, UserPlus, Mail, CheckCircle, XCircle } from 'lucide-react';
import { AddParticipantDialog } from '../participants/AddParticipantDialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MeetingParticipantsProps {
  meetingId: string;
}

export const MeetingParticipants: React.FC<MeetingParticipantsProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error, refetch } = useMeetingParticipants(meetingId);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  const handleAddParticipantSuccess = () => {
    refetch();
  };

  const handleRoleChange = async (participantId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .update({ role: newRole })
        .eq('id', participantId);

      if (error) throw error;
      toast.success('تم تحديث دور المشارك بنجاح');
      refetch();
    } catch (error) {
      console.error('Error updating participant role:', error);
      toast.error('حدث خطأ أثناء تحديث دور المشارك');
    }
  };

  const handleAttendanceChange = async (participantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .update({ attendance_status: newStatus })
        .eq('id', participantId);

      if (error) throw error;
      toast.success('تم تحديث حالة الحضور بنجاح');
      refetch();
    } catch (error) {
      console.error('Error updating attendance status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الحضور');
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;
      toast.success('تم حذف المشارك بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting participant:', error);
      toast.error('حدث خطأ أثناء حذف المشارك');
    }
  };

  // Function to render the appropriate badge for the attendance status
  const renderAttendanceStatus = (status: string, participantId: string) => {
    return (
      <Select
        value={status}
        onValueChange={(value) => handleAttendanceChange(participantId, value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {status === 'confirmed' && <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">مؤكد</Badge>}
            {status === 'attended' && <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">حضر</Badge>}
            {status === 'absent' && <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">غائب</Badge>}
            {status === 'pending' && <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">معلق</Badge>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="confirmed">
            <Badge variant="outline" className="bg-green-100 text-green-800">مؤكد</Badge>
          </SelectItem>
          <SelectItem value="attended">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">حضر</Badge>
          </SelectItem>
          <SelectItem value="absent">
            <Badge variant="outline" className="bg-red-100 text-red-800">غائب</Badge>
          </SelectItem>
          <SelectItem value="pending">
            <Badge variant="outline" className="bg-gray-100 text-gray-800">معلق</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  // Function to render the appropriate dropdown for the role
  const renderRoleSelector = (role: string, participantId: string) => {
    return (
      <Select
        value={role}
        onValueChange={(value) => handleRoleChange(participantId, value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue>
            {role === 'رئيس' && <Badge variant="outline" className="bg-purple-100 text-purple-800">رئيس</Badge>}
            {role === 'عضو' && <Badge variant="outline" className="bg-blue-100 text-blue-800">عضو</Badge>}
            {role === 'مقرر' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">مقرر</Badge>}
            {role === 'ضيف' && <Badge variant="outline" className="bg-gray-100 text-gray-800">ضيف</Badge>}
            {!['رئيس', 'عضو', 'مقرر', 'ضيف'].includes(role) && <Badge variant="outline" className="bg-gray-100 text-gray-800">{role}</Badge>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="رئيس">
            <Badge variant="outline" className="bg-purple-100 text-purple-800">رئيس</Badge>
          </SelectItem>
          <SelectItem value="عضو">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">عضو</Badge>
          </SelectItem>
          <SelectItem value="مقرر">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">مقرر</Badge>
          </SelectItem>
          <SelectItem value="ضيف">
            <Badge variant="outline" className="bg-gray-100 text-gray-800">ضيف</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
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
          <Button variant="outline" size="sm" onClick={() => setIsAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            إضافة مشارك
          </Button>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? (
            <div className="text-center py-8">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المشارك</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>حالة الحضور</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{participant.user_display_name || 'مشارك'}</span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {participant.user_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderRoleSelector(participant.role, participant.id)}
                    </TableCell>
                    <TableCell>
                      {renderAttendanceStatus(participant.attendance_status, participant.id)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteParticipant(participant.id)}>
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddParticipantDialog
        open={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        meetingId={meetingId}
        onSuccess={handleAddParticipantSuccess}
      />
    </>
  );
};
