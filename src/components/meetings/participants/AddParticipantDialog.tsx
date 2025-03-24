
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
import { toast } from "sonner";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void; // Add the missing prop with optional flag
}

export const AddParticipantDialog = ({ open, onOpenChange, meetingId, onSuccess }: AddParticipantDialogProps) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<ParticipantRole>("member");
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("pending");
  const [errors, setErrors] = useState<{
    email?: string;
    displayName?: string;
  }>({});
  
  const { mutate: addParticipant, isPending } = useAddMeetingParticipant();
  
  const validateForm = () => {
    const newErrors: {email?: string; displayName?: string} = {};
    let isValid = true;
    
    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
      isValid = false;
    }
    
    if (!displayName.trim()) {
      newErrors.displayName = "الاسم مطلوب";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        toast.success("تمت إضافة المشارك بنجاح");
        resetForm();
        onOpenChange(false);
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error) => {
        console.error("Error adding participant:", error);
        toast.error("حدث خطأ أثناء إضافة المشارك");
      }
    });
  };
  
  const resetForm = () => {
    setEmail("");
    setDisplayName("");
    setRole("member");
    setAttendanceStatus("pending");
    setErrors({});
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مشارك جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              البريد الإلكتروني <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">
              الاسم <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل اسم المشارك"
              className={errors.displayName ? "border-destructive" : ""}
            />
            {errors.displayName && (
              <p className="text-destructive text-xs">{errors.displayName}</p>
            )}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
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
