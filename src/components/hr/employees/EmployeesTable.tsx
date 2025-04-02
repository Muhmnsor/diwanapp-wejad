
import React from "react";
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
import { MoreVertical, Eye, Edit, Trash } from "lucide-react";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";

interface EmployeesTableProps {
  employees?: any[];
  isLoading: boolean;
}

export function EmployeesTable({ employees, isLoading }: EmployeesTableProps) {
  if (isLoading) {
    return <div className="flex justify-center p-4">جاري تحميل البيانات...</div>;
  }

  if (!employees || employees.length === 0) {
    return <div className="text-center p-4">لا يوجد موظفين</div>;
  }

  return (
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
                  <DropdownMenuItem 
                    onClick={() => {
                      const viewDialog = document.getElementById(`view-employee-${employee.id}`);
                      if (viewDialog) {
                        (viewDialog as HTMLDialogElement).showModal();
                      }
                    }}
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    <span>عرض</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const editDialog = document.getElementById(`edit-employee-${employee.id}`);
                      if (editDialog) {
                        (editDialog as HTMLDialogElement).showModal();
                      }
                    }}
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    <span>تعديل</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      const deleteDialog = document.getElementById(`delete-employee-${employee.id}`);
                      if (deleteDialog) {
                        (deleteDialog as HTMLDialogElement).showModal();
                      }
                    }}
                  >
                    <Trash className="ml-2 h-4 w-4" />
                    <span>حذف</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Hidden dialogs that will be shown via JavaScript */}
              <div className="hidden">
                <ViewEmployeeDialog
                  id={`view-employee-${employee.id}`}
                  employee={employee}
                />
                <EditEmployeeDialog
                  id={`edit-employee-${employee.id}`}
                  employee={employee}
                />
                <DeleteEmployeeDialog
                  id={`delete-employee-${employee.id}`}
                  employee={employee}
                  employeeName={employee.full_name}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
