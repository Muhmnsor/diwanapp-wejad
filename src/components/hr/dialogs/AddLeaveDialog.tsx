
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function AddLeaveDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  
  const { toast } = useToast();
  const { data: leaveTypes, isLoading } = useLeaveTypes();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      // Get the current user info
      const { data: userInfo } = await supabase.auth.getUser();
      
      if (!userInfo?.user) {
        throw new Error("تعذر الحصول على معلومات المستخدم");
      }
      
      // Insert leave request
      const { error } = await supabase
        .from("hr_leave_requests")
        .insert([{
          employee_id: formData.employee_id,
          leave_type_id: formData.leave_type_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          status: "pending",
          created_by: userInfo.user.id
        }]);
        
      if (error) throw error;
      
      toast({
        title: "نجاح",
        description: "تم إضافة طلب الإجازة بنجاح"
      });
      
      // Reset form and close dialog
      setFormData({
        employee_id: "",
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding leave request:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة طلب الإجازة",
        variant: "destructive"
      });
    }
  };
  
  // Get only leave types that match the employee's gender
  const getFilteredLeaveTypes = () => {
    // In a real application, you would fetch the employee's gender
    // const employeeGender = "male"; // or "female"
    
    // For now we'll return all leave types
    return leaveTypes || [];
    
    // Once you have employee gender data, you would filter like this:
    // return leaveTypes?.filter(type => 
    //   type.gender_eligibility === "all" || type.gender_eligibility === employeeGender
    // ) || [];
  };
  
  const filteredLeaveTypes = getFilteredLeaveTypes();
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <CalendarPlus className="h-4 w-4 ml-2" />
        إضافة إجازة
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة طلب إجازة</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee_id" className="text-right">
                الموظف
              </Label>
              <Select 
                onValueChange={(value) => handleSelectChange("employee_id", value)}
                value={formData.employee_id}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">اختر الموظف</SelectItem>
                  {/* You would map through employees here */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leave_type_id" className="text-right">
                نوع الإجازة
              </Label>
              <Select 
                onValueChange={(value) => handleSelectChange("leave_type_id", value)}
                value={formData.leave_type_id}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر نوع الإجازة" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading">جاري التحميل...</SelectItem>
                  ) : filteredLeaveTypes.length > 0 ? (
                    filteredLeaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data">لا توجد أنواع إجازات</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                تاريخ البداية
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                تاريخ النهاية
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                السبب
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
