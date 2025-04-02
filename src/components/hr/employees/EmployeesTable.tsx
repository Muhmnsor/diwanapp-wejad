
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Eye, Edit, Trash, Calendar } from "lucide-react";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";
import { ManageScheduleDialog } from "../dialogs/ManageScheduleDialog";
import { supabase } from "@/integrations/supabase/client";

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

  // Clear selected employee when closing dialogs
  const handleCloseDialog = () => {
    setViewEmployeeOpen(false);
    setEditEmployeeOpen(false);
    setDeleteEmployeeOpen(false);
    setScheduleDialogOpen(false);
    // Don't clear selectedEmployee immediately to avoid UI flickers
    // Allow components to unmount properly first
    setTimeout(() => {
      setSelectedEmployee(null);
    }, 100);
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
            <TableHead className="text-left">الإجراءات</TableHead>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">فتح القائمة</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                      <Eye className="ml-2 h-4 w-4" />
                      <span>عرض</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                      <Edit className="ml-2 h-4 w-4" />
                      <span>تعديل</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageSchedule(employee)}>
                      <Calendar className="ml-2 h-4 w-4" />
                      <span>إدارة جدول العمل</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      <Trash className="ml-2 h-4 w-4" />
                      <span>حذف</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEmployee && (
        <>
          <ViewEmployeeDialog 
            isOpen={viewEmployeeOpen} 
            onClose={handleCloseDialog} 
            employee={selectedEmployee} 
          />
          
          <EditEmployeeDialog 
            isOpen={editEmployeeOpen} 
            onClose={handleCloseDialog} 
            employee={selectedEmployee}
            onSuccess={() => {
              handleCloseDialog();
              if (onRefresh) onRefresh();
            }} 
          />
          
          <DeleteEmployeeDialog 
            isOpen={deleteEmployeeOpen} 
            onClose={handleCloseDialog} 
            employee={selectedEmployee}
            onSuccess={() => {
              handleCloseDialog();
              if (onRefresh) onRefresh();
            }} 
          />
          
          <ManageScheduleDialog
            isOpen={scheduleDialogOpen}
            onClose={handleCloseDialog}
            employee={selectedEmployee}
            onSuccess={() => {
              handleCloseDialog();
              if (onRefresh) onRefresh();
            }}
          />
        </>
      )}
    </>
  );
}
