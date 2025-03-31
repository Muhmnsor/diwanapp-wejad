
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractsTab } from "@/components/hr/tabs/ContractsTab";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  position: string;
  department: string;
  hire_date: string;
  status: string;
  email: string;
  phone: string;
}

interface ViewEmployeeDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  // Fetch additional employee details like attendance, leaves, etc.
  const { data: employeeDetails, isLoading } = useQuery({
    queryKey: ['employee-details', employee.id],
    queryFn: async () => {
      try {
        // Get leave requests count
        const { count: leavesCount, error: leavesError } = await supabase
          .from('hr_leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', employee.id);
          
        if (leavesError) throw leavesError;
        
        // Get training count
        const { count: trainingCount, error: trainingError } = await supabase
          .from('hr_employee_training')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', employee.id);
          
        if (trainingError) throw trainingError;
        
        // Get attendance percentage
        const { count: attendanceCount, error: attendanceError } = await supabase
          .from('hr_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', employee.id)
          .eq('status', 'present');
          
        if (attendanceError) throw attendanceError;
          
        return {
          leavesCount: leavesCount || 0,
          trainingCount: trainingCount || 0,
          attendanceCount: attendanceCount || 0
        };
      } catch (error) {
        console.error('Error fetching employee details:', error);
        return {
          leavesCount: 0,
          trainingCount: 0,
          attendanceCount: 0
        };
      }
    },
    enabled: isOpen
  });
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'on_leave': return 'في إجازة';
      case 'terminated': return 'منتهي';
      default: return status;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الموظف</DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold mx-auto mb-2">
            {employee.full_name?.charAt(0) || "؟"}
          </div>
          <h2 className="text-xl font-bold">{employee.full_name}</h2>
          <p className="text-muted-foreground">{employee.position}</p>
        </div>
        
        <Tabs defaultValue="basic-info">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic-info">المعلومات الأساسية</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="pt-4">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">الرقم الوظيفي</p>
                <p className="font-medium">{employee.employee_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">القسم</p>
                <p className="font-medium">{employee.department || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">تاريخ التعيين</p>
                <p className="font-medium">
                  {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('ar-SA') : "-"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 
                      employee.status === 'on_leave' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {getStatusText(employee.status)}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{employee.email || "-"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium">{employee.phone || "-"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contracts" className="pt-4">
            <ContractsTab employeeId={employee.id} />
          </TabsContent>
          
          <TabsContent value="statistics" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {employeeDetails?.leavesCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">الإجازات</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {employeeDetails?.trainingCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">التدريبات</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {employeeDetails?.attendanceCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">أيام الحضور</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
