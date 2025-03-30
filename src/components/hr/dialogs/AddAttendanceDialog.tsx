
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useAttendanceOperations } from "@/hooks/hr/useAttendanceOperations";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function AddAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { addAttendanceRecord, isLoading: isSubmitting } = useAttendanceOperations();
  
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: today,
    time_in: currentTime,
    time_out: '',
    status: 'present',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addAttendanceRecord(formData);
    if (result.success) {
      setOpen(false);
      // Reset form
      setFormData({
        employee_id: '',
        attendance_date: today,
        time_in: currentTime,
        time_out: '',
        status: 'present',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>تسجيل حضور جديد</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل حضور جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال تفاصيل حضور الموظف
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">الموظف</Label>
              <Select 
                onValueChange={(value) => handleChange('employee_id', value)} 
                value={formData.employee_id}
                required
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="attendance_date">تاريخ الحضور</Label>
              <Input
                id="attendance_date"
                type="date"
                value={formData.attendance_date}
                onChange={(e) => handleChange('attendance_date', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time_in">وقت الحضور</Label>
                <Input
                  id="time_in"
                  type="time"
                  value={formData.time_in}
                  onChange={(e) => handleChange('time_in', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time_out">وقت الانصراف</Label>
                <Input
                  id="time_out"
                  type="time"
                  value={formData.time_out}
                  onChange={(e) => handleChange('time_out', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة</Label>
              <Select 
                onValueChange={(value) => handleChange('status', value)} 
                value={formData.status}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="leave">إجازة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="أضف ملاحظات إضافية هنا"
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !formData.employee_id}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تسجيل الحضور
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
