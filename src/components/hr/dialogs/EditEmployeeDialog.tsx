
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { EmployeeScheduleField } from "../fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";
import { DatePicker } from "@/components/ui/date-picker";

interface EditEmployeeDialogProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditEmployeeDialog({ 
  employee, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditEmployeeDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [gender, setGender] = useState<string>("");
  const [scheduleId, setScheduleId] = useState<string>("");
  const [employeeNumber, setEmployeeNumber] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");
  const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrgUnitId, setCurrentOrgUnitId] = useState<string>("");
  
  useEffect(() => {
    if (employee) {
      setFullName(employee.full_name || "");
      setEmail(employee.email || "");
      setPhone(employee.phone || "");
      setPosition(employee.position || "");
      setGender(employee.gender || "");
      setScheduleId(employee.schedule_id || "");
      setEmployeeNumber(employee.employee_number || "");
      setDepartmentName(employee.department || "");
      
      // Set hire date if available
      if (employee.hire_date) {
        setHireDate(new Date(employee.hire_date));
      }
      
      // Fetch the current organizational unit assignment
      fetchEmployeeOrgUnit(employee.id);
    }
  }, [employee]);
  
  // Fetch current organizational unit
  const fetchEmployeeOrgUnit = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employee_organizational_units')
        .select('organizational_unit_id, is_primary')
        .eq('employee_id', employeeId)
        .eq('is_primary', true)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setCurrentOrgUnitId(data.organizational_unit_id);
        setDepartmentId(data.organizational_unit_id);
      }
    } catch (error) {
      console.error("Error fetching employee organizational unit:", error);
    }
  };
  
  const handleSubmit = async () => {
    if (!fullName) {
      toast.error("الرجاء إدخال اسم الموظف");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update employee record
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          position: position || null,
          gender: gender || null,
          schedule_id: scheduleId || null,
          department: departmentName || null,
          employee_number: employeeNumber || null,
          hire_date: hireDate ? hireDate.toISOString().split('T')[0] : null,
        })
        .eq("id", employee.id);
      
      if (error) throw error;
      
      // If department has changed, update organizational unit assignment
      if (departmentId && departmentId !== currentOrgUnitId) {
        // First check if there's an existing primary assignment
        if (currentOrgUnitId) {
          // Update existing assignment to not be primary
          const { error: updateError } = await supabase
            .from("employee_organizational_units")
            .update({ is_primary: false })
            .eq("employee_id", employee.id)
            .eq("organizational_unit_id", currentOrgUnitId);
            
          if (updateError) {
            console.error("Error updating existing organizational unit:", updateError);
          }
        }
        
        // Check if assignment to the new department already exists
        const { data: existingAssignment, error: checkError } = await supabase
          .from("employee_organizational_units")
          .select("id")
          .eq("employee_id", employee.id)
          .eq("organizational_unit_id", departmentId)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing assignment:", checkError);
        }
        
        if (existingAssignment) {
          // Update the existing assignment to be primary
          const { error: updateError } = await supabase
            .from("employee_organizational_units")
            .update({ is_primary: true })
            .eq("id", existingAssignment.id);
            
          if (updateError) {
            console.error("Error updating assignment to primary:", updateError);
          }
        } else {
          // Create new assignment
          const { error: insertError } = await supabase
            .from("employee_organizational_units")
            .insert({
              employee_id: employee.id,
              organizational_unit_id: departmentId,
              is_primary: true,
              start_date: new Date().toISOString().split('T')[0],
            });
            
          if (insertError) {
            console.error("Error creating new organizational unit assignment:", insertError);
          }
        }
      }
      
      toast.success("تم تحديث بيانات الموظف بنجاح");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
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
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
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
            {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
