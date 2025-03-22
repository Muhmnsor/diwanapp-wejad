
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, UserPlus, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useDeleteMeetingParticipant } from "@/hooks/meetings/useDeleteMeetingParticipant";
import { MeetingParticipant } from "@/types/meeting";
import { AddParticipantDialog } from "./AddParticipantDialog";
import { EmptyState } from "@/components/ui/empty-state";

interface ParticipantsListProps {
  meetingId: string;
}

export const ParticipantsList = ({ meetingId }: ParticipantsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [participantToDelete, setParticipantToDelete] = React.useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId, refreshTrigger);
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleDeleteParticipant = () => {
    if (participantToDelete) {
      deleteParticipant(participantToDelete, {
        onSuccess: () => {
          setParticipantToDelete(null);
          handleRefresh();
        }
      });
    }
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'chairman':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">رئيس</Badge>;
      case 'secretary':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">سكرتير</Badge>;
      case 'member':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">عضو</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">مشاهد</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };
  
  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50">معلق</Badge>;
      case 'attended':
        return <Badge variant="outline" className="bg-green-50">حضر</Badge>;
      case 'excused':
        return <Badge variant="outline" className="bg-blue-50">معتذر</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-50">غائب</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل المشاركين...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المشاركين: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المشاركون</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة مشارك
        </Button>
      </div>
      
      {participants && participants.length === 0 ? (
        <EmptyState
          title="لا يوجد مشاركين"
          description="لم يتم إضافة أي مشاركين لهذا الاجتماع بعد"
          icon={<Users className="h-8 w-8" />}
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مشارك
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">نوع المشارك</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">حالة الحضور</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants && participants.map((participant: MeetingParticipant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium text-right">
                    <div className="flex items-center">
                      {participant.is_external ? (
                        <Badge variant="outline" className="ml-2">خارجي</Badge>
                      ) : (
                        <User className="h-4 w-4 ml-2 text-muted-foreground" />
                      )}
                      {participant.user_display_name}
                    </div>
                    {participant.user_email && (
                      <div className="text-sm text-muted-foreground">
                        {participant.user_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {participant.is_external ? "خارجي" : "داخلي"}
                  </TableCell>
                  <TableCell className="text-right">
                    {getRoleBadge(participant.role)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getAttendanceStatusBadge(participant.attendance_status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setParticipantToDelete(participant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AddParticipantDialog
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        meetingId={meetingId}
        onSuccess={handleRefresh}
      />
      
      <DeleteDialog
        open={!!participantToDelete}
        onOpenChange={() => setParticipantToDelete(null)}
        title="حذف المشارك"
        description="هل أنت متأكد من رغبتك في حذف هذا المشارك؟ لا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDeleteParticipant}
        isDeleting={isDeleting}
      />
    </div>
  );
};
