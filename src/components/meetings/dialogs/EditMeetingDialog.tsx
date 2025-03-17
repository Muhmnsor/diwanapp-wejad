
import { useState, useEffect } from "react";
import { Meeting } from "@/types/meeting";
import { useUpdateMeeting } from "@/hooks/meetings/useUpdateMeeting";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EditMeetingDialogProps {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditMeetingDialog = ({
  meeting,
  open,
  onOpenChange,
  onSuccess
}: EditMeetingDialogProps) => {
  const [title, setTitle] = useState(meeting.title);
  const [meetingType, setMeetingType] = useState(meeting.meeting_type);
  const [date, setDate] = useState(meeting.date);
  const [startTime, setStartTime] = useState(meeting.start_time);
  const [duration, setDuration] = useState<number>(meeting.duration);
  const [location, setLocation] = useState(meeting.location || "");
  const [meetingLink, setMeetingLink] = useState(meeting.meeting_link || "");
  const [objectives, setObjectives] = useState(meeting.objectives || "");
  const [attendanceType, setAttendanceType] = useState(meeting.attendance_type);
  const [status, setStatus] = useState(meeting.meeting_status);
  
  const { mutate: updateMeeting, isPending } = useUpdateMeeting();
  
  // تحديث النموذج عند تغيير بيانات الاجتماع
  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setMeetingType(meeting.meeting_type);
      setDate(meeting.date);
      setStartTime(meeting.start_time);
      setDuration(meeting.duration);
      setLocation(meeting.location || "");
      setMeetingLink(meeting.meeting_link || "");
      setObjectives(meeting.objectives || "");
      setAttendanceType(meeting.attendance_type);
      setStatus(meeting.meeting_status);
    }
  }, [meeting, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMeeting({
      id: meeting.id,
      updates: {
        title,
        meeting_type: meetingType,
        date,
        start_time: startTime,
        duration,
        location: location || undefined,
        meeting_link: meetingLink || undefined,
        objectives: objectives || undefined,
        attendance_type: attendanceType,
        meeting_status: status
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل الاجتماع</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">عنوان الاجتماع *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-type">نوع الاجتماع</Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع الاجتماع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">مجلس إدارة</SelectItem>
                    <SelectItem value="department">قسم</SelectItem>
                    <SelectItem value="team">فريق</SelectItem>
                    <SelectItem value="committee">لجنة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">حالة الاجتماع</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="حالة الاجتماع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">مجدول</SelectItem>
                    <SelectItem value="in_progress">جاري</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-time">وقت البدء *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">المدة (دقائق) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="attendance-type">نوع الحضور</Label>
              <Select value={attendanceType} onValueChange={setAttendanceType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الحضور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">حضوري</SelectItem>
                  <SelectItem value="virtual">افتراضي</SelectItem>
                  <SelectItem value="hybrid">مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(attendanceType === 'in_person' || attendanceType === 'hybrid') && (
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="أدخل موقع الاجتماع"
                />
              </div>
            )}
            
            {(attendanceType === 'virtual' || attendanceType === 'hybrid') && (
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="meeting-link">رابط الاجتماع</Label>
                <Input
                  id="meeting-link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="أدخل رابط الاجتماع الافتراضي"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="objectives">أهداف الاجتماع</Label>
              <Textarea
                id="objectives"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="أدخل أهداف الاجتماع"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-start gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!title || !date || !startTime || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
