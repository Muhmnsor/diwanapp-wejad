
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
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";
import { DatePicker } from "@/components/ui/date-picker";

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
  const [employeeNumber, setEmployeeNumber] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");
  const [hireDate, setHireDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { defaultSchedule } = useEmployeeSchedule();

  const handleSubmit = async () => {
    if (!fullName) {
      toast.error("الرجاء إدخال اسم الموظف");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert employee record
      const { data, error } = await supabase
        .from("employees")
        .insert({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          position: position || null,
          gender: gender || null,
          schedule_id: scheduleId || null,
          department: departmentName || null,
          employee_number: employeeNumber || null,
          hire_date: hireDate ? hireDate.toISOString().split('T')[0] : null,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      // If department is selected, add to organizational unit assignment
      if (departmentId && data?.id) {
        const { error: unitError } = await supabase
          .from("employee_organizational_units")
          .insert({
            employee_id: data.id,
            organizational_unit_id: departmentId,
            is_primary: true,
            start_date: hireDate ? hireDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          });

        if (unitError) {
          console.error("Error assigning department:", unitError);
          // Continue anyway, the employee is created
        }
      }

      toast.success("تم إضافة الموظف بنجاح");
      if (onSuccess) onSuccess();
      
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setPosition("");
      setGender("");
      setScheduleId("");
      setEmployeeNumber("");
      setDepartmentId("");
      setDepartmentName("");
      setHireDate(new Date());
      
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentChange = (id: string, name?: string) => {
    setDepartmentId(id);
    if (name) {
      setDepartmentName(name);
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
            <Label htmlFor="employeeNumber">الرقم الوظيفي</Label>
            <Input
              id="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="أدخل الرقم الوظيفي"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hireDate">تاريخ التعيين</Label>
            <DatePicker
              date={hireDate}
              setDate={setHireDate}
              locale="ar"
              placeholder="اختر تاريخ التعيين"
            />
          </div>
          
          <OrganizationalUnitField
            value={departmentId}
            onChange={handleDepartmentChange}
          />
          
          <GenderField 
            value={gender} 
            onChange={setGender} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="position">المسمى الوظيفي</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="أدخل المسمى الوظيفي"
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
