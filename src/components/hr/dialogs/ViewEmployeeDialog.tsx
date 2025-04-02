
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, FileText, User } from "lucide-react";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";

interface Employee {
  id: string;
  full_name: string;
  employee_number: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  status: string;
}

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export function ViewEmployeeDialog({ isOpen, onClose, employee }: ViewEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  const { contracts, isLoading: contractsLoading } = useEmployeeContracts(employee?.id);

  useEffect(() => {
    if (isOpen && employee) {
      setLoading(true);
      const fetchEmployeeDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employee.id)
            .single();

          if (error) throw error;
          
          setEmployeeDetails(data);
        } catch (error) {
          console.error('Error fetching employee details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeDetails();
    }
  }, [isOpen, employee]);

  const fetchAttendanceRecords = async () => {
    if (!employee?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .order('attendance_date', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  };

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'attendance' && employee?.id) {
      setAttendanceLoading(true);
      fetchAttendanceRecords().then(records => {
        setAttendanceRecords(records);
        setAttendanceLoading(false);
      });
    }
  }, [activeTab, employee?.id]);

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">معلومات الموظف</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              المعلومات الأساسية
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              العقود
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              الحضور
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic">
            {loading ? (
              <div className="flex justify-center py-4">جاري التحميل...</div>
            ) : employeeDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-semibold">{employeeDetails.full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">الرقم الوظيفي</p>
                    <p>{employeeDetails.employee_number || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">المسمى الوظيفي</p>
                    <p>{employeeDetails.position || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">القسم</p>
                    <p>{employeeDetails.department || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p>{employeeDetails.email || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p>{employeeDetails.phone || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التعيين</p>
                    <p>{employeeDetails.hire_date ? new Date(employeeDetails.hire_date).toLocaleDateString('ar-SA') : '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <p>
                      <Badge className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        employeeDetails.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employeeDetails.status === 'active' ? 'يعمل' : 'منتهي'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">لا توجد بيانات متاحة</div>
            )}
          </TabsContent>
          
          {/* Contracts Tab */}
          <TabsContent value="contracts">
            {contractsLoading ? (
              <div className="flex justify-center py-4">جاري تحميل بيانات العقود...</div>
            ) : contracts && contracts.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع العقد</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الراتب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contracts.map((contract) => (
                        <tr key={contract.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {contract.contract_type === 'permanent' ? 'دائم' : 
                             contract.contract_type === 'temporary' ? 'مؤقت' : 
                             contract.contract_type === 'contract' ? 'تعاقد' : contract.contract_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(contract.start_date).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {contract.end_date ? new Date(contract.end_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {contract.salary ? `${contract.salary} ر.س` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge className={`inline-flex px-2 py-1 rounded-full text-xs ${
                              contract.status === 'active' ? 'bg-green-100 text-green-800' : 
                              contract.status === 'expired' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {contract.status === 'active' ? 'ساري' : 
                               contract.status === 'expired' ? 'منتهي' : 
                               'ملغي'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">لا توجد عقود مسجلة لهذا الموظف</div>
            )}
          </TabsContent>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance">
            {attendanceLoading ? (
              <div className="flex justify-center py-4">جاري تحميل سجلات الحضور...</div>
            ) : attendanceRecords && attendanceRecords.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الحضور</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الانصراف</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record: any) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(record.attendance_date).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.check_in ? new Date(record.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.check_out ? new Date(record.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge className={`inline-flex px-2 py-1 rounded-full text-xs ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' : 
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                              record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status === 'present' ? 'حاضر' : 
                               record.status === 'late' ? 'متأخر' : 
                               record.status === 'absent' ? 'غائب' : 
                               record.status === 'leave' ? 'إجازة' : record.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">لا توجد سجلات حضور لهذا الموظف</div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
