
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LeaveType, GenderEligibility } from "@/hooks/hr/useLeaveTypes";

export function LeaveTypesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    max_days: number;
    is_paid: boolean;
    requires_approval: boolean;
    gender_eligibility: GenderEligibility;
  }>({
    code: "",
    name: "",
    description: "",
    max_days: 30,
    is_paid: true,
    requires_approval: true,
    gender_eligibility: "all",
  });
  
  const { toast } = useToast();
  
  // Fetch leave types
  const { data: leaveTypes, isLoading, refetch } = useQuery({
    queryKey: ["hr-leave-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_leave_types")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data as LeaveType[];
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleRadioChange = (value: GenderEligibility) => {
    setFormData(prev => ({ ...prev, gender_eligibility: value }));
  };
  
  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("hr_leave_types")
        .insert([{
          code: formData.code,
          name: formData.name,
          description: formData.description,
          max_days: formData.max_days,
          is_paid: formData.is_paid,
          requires_approval: formData.requires_approval,
          gender_eligibility: formData.gender_eligibility,
          is_active: true
        }]);
        
      if (error) throw error;
      
      toast({
        title: "نجاح",
        description: "تم إضافة نوع الإجازة بنجاح"
      });
      
      // Reset form and close dialog
      setFormData({
        code: "",
        name: "",
        description: "",
        max_days: 30,
        is_paid: true,
        requires_approval: true,
        gender_eligibility: "all",
      });
      setIsDialogOpen(false);
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error("Error adding leave type:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة نوع الإجازة",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">أنواع الإجازات</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة نوع إجازة
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة أنواع الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>مدة الأيام</TableHead>
                  <TableHead>مدفوعة</TableHead>
                  <TableHead>تتطلب موافقة</TableHead>
                  <TableHead>متاحة لـ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes && leaveTypes.length > 0 ? (
                  leaveTypes.map(leaveType => (
                    <TableRow key={leaveType.id}>
                      <TableCell>{leaveType.code}</TableCell>
                      <TableCell>{leaveType.name}</TableCell>
                      <TableCell>{leaveType.description || "-"}</TableCell>
                      <TableCell>{leaveType.max_days || "-"}</TableCell>
                      <TableCell>{leaveType.is_paid ? "نعم" : "لا"}</TableCell>
                      <TableCell>{leaveType.requires_approval ? "نعم" : "لا"}</TableCell>
                      <TableCell>
                        {leaveType.gender_eligibility === "all" && "الجميع"}
                        {leaveType.gender_eligibility === "male" && "الذكور فقط"}
                        {leaveType.gender_eligibility === "female" && "الإناث فقط"}
                        {!leaveType.gender_eligibility && "الجميع"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      لا توجد أنواع إجازات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Leave Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة نوع إجازة جديد</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                الكود
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                الوصف
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_days" className="text-right">
                عدد الأيام
              </Label>
              <Input
                id="max_days"
                name="max_days"
                type="number"
                value={formData.max_days}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                مدفوعة
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("is_paid", checked as boolean)
                  }
                />
                <Label htmlFor="is_paid" className="mr-2">نعم</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                تتطلب موافقة
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="requires_approval"
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("requires_approval", checked as boolean)
                  }
                />
                <Label htmlFor="requires_approval" className="mr-2">نعم</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">
                متاحة لـ
              </Label>
              <RadioGroup 
                value={formData.gender_eligibility} 
                onValueChange={handleRadioChange}
                className="col-span-3 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="mr-2">الجميع</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="mr-2">الذكور فقط</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="mr-2">الإناث فقط</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
