import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  email?: string;
  position?: string;
  department?: string;
  joining_date?: string;
  phone?: string;
  schedule_id?: string;
  status?: string;
}

interface EmployeesTableProps {
  employees?: Employee[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function EmployeesTable({ employees = [], isLoading, onRefresh }: EmployeesTableProps) {
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewEmployee = (employee: Employee) => {
    setViewEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium mb-2">لا يوجد موظفين</p>
          <p className="text-muted-foreground">يمكنك إضافة موظفين جدد باستخدام زر "إضافة موظف"</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرقم الوظيفي</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>المنصب</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>تاريخ التعيين</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.employee_number}</TableCell>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.position || "-"}</TableCell>
                <TableCell>{employee.department || "-"}</TableCell>
                <TableCell>
                  {employee.joining_date 
                    ? new Date(employee.joining_date).toLocaleDateString('ar-SA') 
                    : "-"}
                </TableCell>
                <TableCell>
                  {employee.status && (
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                        <Eye className="ml-2 h-4 w-4" />
                        عرض
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEmployee(employee)} className="text-red-600">
                        <Trash className="ml-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewEmployee && (
        <ViewEmployeeDialog 
          employee={viewEmployee} 
          isOpen={isViewDialogOpen} 
          onClose={() => setIsViewDialogOpen(false)} 
        />
      )}
      
      {editEmployee && (
        <EditEmployeeDialog 
          employee={editEmployee} 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          onSuccess={() => {
            handleSuccess();
            setIsEditDialogOpen(false);
          }} 
        />
      )}
      
      <DeleteEmployeeDialog 
        employee={deleteEmployee}
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onSuccess={() => {
          handleSuccess();
          setIsDeleteDialogOpen(false);
        }} 
      />
    </>
  );
}
