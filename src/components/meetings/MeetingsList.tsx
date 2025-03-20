
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meeting } from "@/types/meeting";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Pencil, 
  Plus, 
  Trash2, 
  Loader2,
  CalendarClock
} from "lucide-react";
import { formatDate, formatTime, formatDuration } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";
import { MeetingDialogWrapper } from "./dialogs/MeetingDialogWrapper";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  folderId?: string;
  onCreate?: () => void;
}

export const MeetingsList = ({ 
  meetings, 
  isLoading, 
  error, 
  folderId,
  onCreate 
}: MeetingsListProps) => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting();
  
  const handleDeleteMeeting = () => {
    if (meetingToDelete) {
      deleteMeeting(meetingToDelete, {
        onSuccess: () => {
          setMeetingToDelete(null);
          if (onCreate) onCreate();
        }
      });
    }
  };
  
  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50">مجدول</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50">جاري</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50">ملغي</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل الاجتماعات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل الاجتماعات: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">الاجتماعات</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          اجتماع جديد
        </Button>
      </div>
      
      {meetings.length === 0 ? (
        <EmptyState
          title="لا توجد اجتماعات"
          description="لم يتم إنشاء أي اجتماعات بعد"
          icon={<CalendarClock className="h-8 w-8" />}
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء اجتماع
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوقت</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow 
                  key={meeting.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                >
                  <TableCell className="font-medium text-right">{meeting.title}</TableCell>
                  <TableCell className="text-right">
                    {meeting.meeting_type === 'board' && 'مجلس إدارة'}
                    {meeting.meeting_type === 'department' && 'قسم'}
                    {meeting.meeting_type === 'team' && 'فريق'}
                    {meeting.meeting_type === 'committee' && 'لجنة'}
                    {meeting.meeting_type === 'other' && 'أخرى'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                      {formatDate(meeting.date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                      {formatTime(meeting.start_time)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatDuration(meeting.duration)}</TableCell>
                  <TableCell className="text-right">{getMeetingStatusBadge(meeting.meeting_status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/meetings/${meeting.id}`);
                          }}
                          className="text-right"
                        >
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}
                          className="text-right"
                        >
                          <Pencil className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMeetingToDelete(meeting.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <MeetingDialogWrapper 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={onCreate}
        folderId={folderId}
      />
      
      <DeleteDialog
        open={!!meetingToDelete}
        onOpenChange={() => setMeetingToDelete(null)}
        title="حذف الاجتماع"
        description="هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ لا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDeleteMeeting}
        isDeleting={isDeleting}
      />
    </div>
  );
};
