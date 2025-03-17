
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParticipantRole, AttendanceStatus } from "@/types/meeting";
import { useAddMeetingParticipant } from "@/hooks/meetings/useAddMeetingParticipant";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
}

export const AddParticipantDialog = ({ open, onOpenChange, meetingId }: AddParticipantDialogProps) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<ParticipantRole>("member");
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("pending");
  
  const { mutate: addParticipant, isPending } = useAddMeetingParticipant();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !displayName.trim()) return;
    
    addParticipant({
      meetingId,
      participant: {
        user_email: email,
        user_display_name: displayName,
        role,
        attendance_status: attendanceStatus
      }
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };
  
  const resetForm = () => {
    setEmail("");
    setDisplayName("");
    setRole("member");
    setAttendanceStatus("pending");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مشارك جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">الاسم</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل اسم المشارك"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">دور المشارك</Label>
            <Select value={role} onValueChange={(value) => setRole(value as ParticipantRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر دور المشارك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizer">منظم</SelectItem>
                <SelectItem value="presenter">مقدم</SelectItem>
                <SelectItem value="member">عضو</SelectItem>
                <SelectItem value="guest">ضيف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attendanceStatus">حالة الحضور</Label>
            <Select value={attendanceStatus} onValueChange={(value) => setAttendanceStatus(value as AttendanceStatus)}>
              <SelectTrigger id="attendanceStatus">
                <SelectValue placeholder="اختر حالة الحضور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="attended">حضر</SelectItem>
                <SelectItem value="absent">متغيب</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
