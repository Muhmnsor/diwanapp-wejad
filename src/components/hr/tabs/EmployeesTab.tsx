
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2, Plus, Trash, Edit, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddEmployeeDialog } from "../dialogs/AddEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";
import { usePermissions } from "@/components/permissions/usePermissions";

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

interface EmployeesTabProps {
  searchTerm?: string;
}

export function EmployeesTab({ searchTerm = "" }: EmployeesTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { hasPermission } = usePermissions();
  const canManageEmployees = hasPermission("hr", "manage_employees");
  
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      return data as Employee[];
    }
  });
  
  // Filter employees based on search term
  const filteredEmployees = employees?.filter(employee => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.full_name.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower) ||
      employee.department?.toLowerCase().includes(searchLower) ||
      employee.employee_number?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };
  
  const onEmployeeAdded = async () => {
    toast.success("تمت إضافة الموظف بنجاح");
    await refetch();
    setIsAddDialogOpen(false);
  };
  
  const onEmployeeUpdated = async () => {
    toast.success("تم تحديث بيانات الموظف بنجاح");
    await refetch();
    setIsEditDialogOpen(false);
  };
  
  const onEmployeeDeleted = async () => {
    toast.success("تم حذف الموظف بنجاح");
    await refetch();
    setIsDeleteDialogOpen(false);
  };
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الموظفين</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          <Button className="mt-4" onClick={() => refetch()}>إعادة المحاولة</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">الموظفين</h2>
        {canManageEmployees && (
          <Button onClick={handleAddEmployee} className="flex items-center gap-2">
            <Plus size={16} />
            <span>إضافة موظف</span>
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="mr-2">جاري تحميل البيانات...</span>
            </div>
          ) : filteredEmployees?.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">لا توجد بيانات موظفين متاحة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الرقم الوظيفي</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">المسمى الوظيفي</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">تاريخ التعيين</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="text-right">{employee.employee_number}</TableCell>
                    <TableCell className="text-right">{employee.full_name}</TableCell>
                    <TableCell className="text-right">{employee.position}</TableCell>
                    <TableCell className="text-right">{employee.department}</TableCell>
                    <TableCell className="text-right">{new Date(employee.hire_date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 
                          employee.status === 'on_leave' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {employee.status === 'active' ? 'نشط' : 
                         employee.status === 'on_leave' ? 'في إجازة' : 
                         employee.status === 'terminated' ? 'منتهي' : employee.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewEmployee(employee)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManageEmployees && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee)}>
                              <Trash className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={onEmployeeAdded}
      />
      
      {selectedEmployee && (
        <>
          <ViewEmployeeDialog
            employee={selectedEmployee}
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
          />
          
          <EditEmployeeDialog
            employee={selectedEmployee}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSuccess={onEmployeeUpdated}
          />
          
          <DeleteEmployeeDialog
            employee={selectedEmployee}
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onSuccess={onEmployeeDeleted}
          />
        </>
      )}
    </>
  );
}
