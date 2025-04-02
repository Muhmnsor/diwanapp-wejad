
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenderField } from "../fields/GenderField";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { EmployeeScheduleField } from "../fields/EmployeeScheduleField";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddEmployeeDialog({ isOpen, onClose, onSuccess }: AddEmployeeDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [gender, setGender] = useState<string>("");
  const [scheduleId, setScheduleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { defaultSchedule } = useEmployeeSchedule();

  const handleSubmit = async () => {
    if (!fullName) {
      toast.error("الرجاء إدخال اسم الموظف");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("employees")
        .insert({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          position: position || null,
          gender: gender || null,
          schedule_id: scheduleId || null,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("تم إضافة الموظف بنجاح");
      if (onSuccess) onSuccess();
      
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setPosition("");
      setGender("");
      setScheduleId("");
      
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleChange = (value: string) => {
    setScheduleId(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">اسم الموظف</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل اسم الموظف"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">المسمى الوظيفي</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="أدخل المسمى الوظيفي"
            />
          </div>

          <GenderField 
            value={gender} 
            onChange={setGender} 
          />
          
          <EmployeeScheduleField
            value={scheduleId}
            onChange={handleScheduleChange}
          />
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
