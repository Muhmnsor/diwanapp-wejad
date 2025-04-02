
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash, Calendar } from "lucide-react";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";
import { ManageScheduleDialog } from "../dialogs/ManageScheduleDialog";

interface EmployeesTableProps {
  employees?: any[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function EmployeesTable({ employees, isLoading, onRefresh }: EmployeesTableProps) {
  const [viewEmployeeOpen, setViewEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [deleteEmployeeOpen, setDeleteEmployeeOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setViewEmployeeOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEditEmployeeOpen(true);
  };

  const handleDeleteEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setDeleteEmployeeOpen(true);
  };
  
  const handleManageSchedule = (employee: any) => {
    setSelectedEmployee(employee);
    setScheduleDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">جاري تحميل البيانات...</div>;
  }

  if (!employees || employees.length === 0) {
    return <div className="text-center p-4">لا يوجد موظفين</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>المسمى الوظيفي</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ التعيين</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <Badge
                  variant={employee.status === "active" ? "outline" : "secondary"}
                  className={
                    employee.status === "active"
                      ? "bg-green-50 text-green-700 hover:bg-green-50"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }
                >
                  {employee.status === "active" ? "يعمل" : "منتهي"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(employee.hire_date).toLocaleDateString("ar-SA")}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewEmployee(employee)}
                    title="عرض"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Button>
                  
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                    title="تعديل"
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleManageSchedule(employee)}
                    title="إدارة جدول العمل"
                  >
                    <Calendar className="h-4 w-4 text-green-500" />
                  </Button>
                  
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee)}
                    title="حذف"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEmployee && (
        <>
          <ViewEmployeeDialog 
            isOpen={viewEmployeeOpen} 
            onClose={() => setViewEmployeeOpen(false)} 
            employee={selectedEmployee} 
          />
          
          <EditEmployeeDialog 
            isOpen={editEmployeeOpen} 
            onClose={() => setEditEmployeeOpen(false)} 
            employee={selectedEmployee}
            onSuccess={() => {
              setEditEmployeeOpen(false);
              if (onRefresh) onRefresh();
            }} 
          />
          
          <DeleteEmployeeDialog 
            isOpen={deleteEmployeeOpen} 
            onClose={() => setDeleteEmployeeOpen(false)} 
            employee={selectedEmployee}
            onSuccess={() => {
              setDeleteEmployeeOpen(false);
              if (onRefresh) onRefresh();
            }} 
          />
          
          <ManageScheduleDialog
            isOpen={scheduleDialogOpen}
            onClose={() => setScheduleDialogOpen(false)}
            employee={selectedEmployee}
            onSuccess={() => {
              setScheduleDialogOpen(false);
              if (onRefresh) onRefresh();
            }}
          />
        </>
      )}
    </>
  );
}
