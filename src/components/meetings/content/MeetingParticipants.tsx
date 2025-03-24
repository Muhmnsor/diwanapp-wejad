
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { Plus, UserPlus, Check, X, Clock } from "lucide-react";
import { AddParticipantDialog } from "../participants/AddParticipantDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingParticipantsProps {
  meetingId: string;
}

export const MeetingParticipants: React.FC<MeetingParticipantsProps> = ({ meetingId }) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const { data: participants, isLoading, error, refetch } = useMeetingParticipants(meetingId);
  
  const handleParticipantAdded = () => {
    refetch();
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'attended':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'أكد الحضور';
      case 'attended': return 'حاضر';
      case 'absent': return 'غائب';
      case 'pending':
      default: return 'في الانتظار';
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'organizer': return 'منظم';
      case 'presenter': return 'مقدم';
      case 'member': return 'عضو';
      case 'guest': return 'ضيف';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle>المشاركون</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </Button>
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
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle>المشاركون</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddParticipantOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </Button>
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
        <CardHeader className="pb-3 flex flex-row justify-between items-center">
          <CardTitle>المشاركون ({participants?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </Button>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا يوجد مشاركون مضافون بعد</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-right">
                <thead className="border-b">
                  <tr>
                    <th className="pb-2 font-medium text-gray-600">الاسم</th>
                    <th className="pb-2 font-medium text-gray-600">البريد الإلكتروني</th>
                    <th className="pb-2 font-medium text-gray-600">الدور</th>
                    <th className="pb-2 font-medium text-gray-600">حالة الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="py-3">{participant.user_display_name || 'غير محدد'}</td>
                      <td className="py-3">{participant.user_email}</td>
                      <td className="py-3">{getRoleLabel(participant.role)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(participant.attendance_status)}
                          <span>{getStatusLabel(participant.attendance_status)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddParticipantDialog
        open={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        meetingId={meetingId}
        onSuccess={handleParticipantAdded}
      />
    </>
  );
};
