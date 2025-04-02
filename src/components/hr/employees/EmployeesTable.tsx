
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
import { MoreVertical, Eye, Edit, Trash } from "lucide-react";
import { ViewEmployeeDialog } from "../dialogs/ViewEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";
import { EmptyState } from "@/components/ui/empty-state";

interface EmployeesTableProps {
  employees?: any[];
  isLoading: boolean;
}

export function EmployeesTable({ employees, isLoading }: EmployeesTableProps) {
  const [viewEmployee, setViewEmployee] = useState<any | null>(null);
  const [editEmployee, setEditEmployee] = useState<any | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
                    <DropdownMenuItem onClick={() => {
                      setViewEmployee(employee);
                      setIsViewDialogOpen(true);
                    }}>
                      <Eye className="ml-2 h-4 w-4" />
                      <span>عرض</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      setEditEmployee(employee);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="ml-2 h-4 w-4" />
                      <span>تعديل</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setDeleteEmployee(employee);
                        setIsDeleteDialogOpen(true);
                      }}
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

      {viewEmployee && (
        <ViewEmployeeDialog 
          employee={viewEmployee}
          isOpen={isViewDialogOpen} 
          onClose={() => {
            setIsViewDialogOpen(false);
            setViewEmployee(null);
          }} 
        />
      )}
      
      {editEmployee && (
        <EditEmployeeDialog 
          employee={editEmployee}
          isOpen={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditEmployee(null);
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setEditEmployee(null);
            // Refresh the employees list
            window.location.reload();
          }}
        />
      )}
      
      {deleteEmployee && (
        <DeleteEmployeeDialog 
          employee={deleteEmployee}
          isOpen={isDeleteDialogOpen} 
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteEmployee(null);
          }}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            setDeleteEmployee(null);
            // Refresh the employees list
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
