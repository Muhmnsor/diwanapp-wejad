
import React from "react";
import { Meeting, MeetingStatus } from "@/types/meeting";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingStatusBadge } from "../status/MeetingStatusBadge";
import { formatDate } from "@/lib/utils";

interface AllMeetingsTableProps {
  meetings: Meeting[];
  isLoading: boolean;
  onDelete: (meeting: Meeting) => void;
}

export const AllMeetingsTable = ({ meetings, isLoading, onDelete }: AllMeetingsTableProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (meetingId: string) => {
    navigate(`/admin/meetings/${meetingId}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد اجتماعات متاحة</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان الاجتماع</TableHead>
            <TableHead>التصنيف</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>المنشئ</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell className="font-medium">{meeting.title}</TableCell>
              <TableCell>
                {meeting.folder?.name || 
                 (meeting.folder_name ? meeting.folder_name : "غير مصنف")}
              </TableCell>
              <TableCell>{formatDate(meeting.date)}</TableCell>
              <TableCell>
                <MeetingStatusBadge status={meeting.meeting_status as MeetingStatus} />
              </TableCell>
              <TableCell>
                {meeting.creator?.display_name || "غير محدد"}
              </TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => handleViewDetails(meeting.id)}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => onDelete(meeting)}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
};
