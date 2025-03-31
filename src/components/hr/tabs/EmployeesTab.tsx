
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, FileSearch, UserCog, AlertCircle, Bell } from "lucide-react";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewEmployeeDialog } from "@/components/hr/dialogs/ViewEmployeeDialog";
import { AddEmployeeDialog } from "@/components/hr/dialogs/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/hr/dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/hr/dialogs/DeleteEmployeeDialog";
import { UserEmployeeLink } from "@/components/hr/user-management/UserEmployeeLink";
import { ContractAlerts } from "@/components/hr/contract-alerts/ContractAlerts";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function EmployeesTab() {
  const [isAlertsOpen, setIsAlertsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserLinkDialogOpen, setIsUserLinkDialogOpen] = useState(false);
  
  const { data: employees, isLoading, refetch } = useEmployees();
  
  const filteredEmployees = employees?.filter(employee => 
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleRefresh = () => {
    refetch();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-500 text-green-600">نشط</Badge>;
      case 'on_leave':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">في إجازة</Badge>;
      case 'terminated':
        return <Badge variant="outline" className="border-red-500 text-red-600">غير نشط</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الموظفون</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة موظف
        </Button>
      </div>
      
      {/* Contract Alerts Section */}
      <Collapsible
        open={isAlertsOpen}
        onOpenChange={setIsAlertsOpen}
        className="bg-muted/40 rounded-md"
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center">
            <Bell className="h-5 w-5 ml-2 text-amber-500" />
            تنبيهات العقود والفترات التجريبية
          </h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isAlertsOpen ? 'إخفاء' : 'عرض'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="px-4 pb-4">
          <ContractAlerts />
        </CollapsibleContent>
      </Collapsible>
      
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Input
            placeholder="البحث عن موظف..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">المسمى الوظيفي</TableHead>
                <TableHead className="text-right">تاريخ التعيين</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees && filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                          {employee.full_name.charAt(0)}
                        </div>
                        <div>
                          <p>{employee.full_name}</p>
                          <p className="text-xs text-muted-foreground">#{employee.employee_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department || "-"}</TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>
                      {employee.hire_date ? 
                        new Date(employee.hire_date).toLocaleDateString('ar-SA') : 
                        "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <FileSearch className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsUserLinkDialogOpen(true);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery ? (
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">لا توجد نتائج</p>
                        <p className="text-sm text-muted-foreground">
                          لم يتم العثور على موظفين مطابقين لـ "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">لا يوجد موظفين</p>
                        <p className="text-sm text-muted-foreground">
                          لم يتم العثور على سجلات للموظفين
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* View Employee Dialog */}
      {isViewDialogOpen && selectedEmployee && (
        <ViewEmployeeDialog
          employee={selectedEmployee}
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
        />
      )}
      
      {/* Add Employee Dialog */}
      {isAddDialogOpen && (
        <AddEmployeeDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
      
      {/* Edit Employee Dialog */}
      {isEditDialogOpen && selectedEmployee && (
        <EditEmployeeDialog
          employee={selectedEmployee}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
      
      {/* Delete Employee Dialog */}
      {isDeleteDialogOpen && selectedEmployee && (
        <DeleteEmployeeDialog
          employee={selectedEmployee}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
      
      {/* User-Employee Link Dialog */}
      {isUserLinkDialogOpen && selectedEmployee && (
        <UserEmployeeLink
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.full_name}
          currentUserId={selectedEmployee.user_id}
          isOpen={isUserLinkDialogOpen}
          onClose={() => setIsUserLinkDialogOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
