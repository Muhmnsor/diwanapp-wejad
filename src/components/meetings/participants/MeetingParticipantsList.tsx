
import { useState } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddParticipantDialog } from "./AddParticipantDialog";

interface MeetingParticipantsListProps {
  participants: MeetingParticipant[];
  isLoading: boolean;
  error: Error | null;
  meetingId?: string;
}

export const MeetingParticipantsList = ({ 
  participants, 
  isLoading, 
  error,
  meetingId 
}: MeetingParticipantsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "organizer":
        return <Badge className="bg-green-100 text-green-800">منظم</Badge>;
      case "presenter":
        return <Badge className="bg-blue-100 text-blue-800">مقدم</Badge>;
      case "member":
        return <Badge className="bg-gray-100 text-gray-800">عضو</Badge>;
      case "guest":
        return <Badge className="bg-purple-100 text-purple-800">ضيف</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">مؤكد</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">قيد الإنتظار</Badge>;
      case "attended":
        return <Badge className="bg-blue-100 text-blue-800">حضر</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">متغيب</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المشاركين...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المشاركين: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المشاركون ({participants.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          إضافة مشارك
        </Button>
      </div>
      
      {participants.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا يوجد مشاركون في هذا الاجتماع</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة مشارك
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>حالة الحضور</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.user_display_name || 'غير محدد'}
                  </TableCell>
                  <TableCell>{participant.user_email || '-'}</TableCell>
                  <TableCell>{getRoleBadge(participant.role)}</TableCell>
                  <TableCell>{getStatusBadge(participant.attendance_status)}</TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="sm">
                      تعديل
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {meetingId && (
        <AddParticipantDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          meetingId={meetingId}
        />
      )}
    </div>
  );
};
