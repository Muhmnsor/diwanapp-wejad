
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Eye, Edit, Trash } from "lucide-react";
import { DeleteEmployeeDialog } from "@/components/hr/dialogs/DeleteEmployeeDialog";

interface EmployeesTableProps {
  employees?: any[];
  isLoading: boolean;
}

export function EmployeesTable({ employees, isLoading }: EmployeesTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
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
                      setSelectedEmployee(employee);
                      setIsViewDialogOpen(true);
                    }}>
                      <Eye className="ml-2 h-4 w-4" />
                      <span>عرض</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedEmployee(employee);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="ml-2 h-4 w-4" />
                      <span>تعديل</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedEmployee(employee);
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

      {/* View Employee Dialog */}
      {isViewDialogOpen && selectedEmployee && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent dir="rtl" className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>تفاصيل الموظف</DialogTitle>
              <DialogDescription>
                عرض بيانات {selectedEmployee.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">الاسم</p>
                  <p className="text-md">{selectedEmployee.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">المسمى الوظيفي</p>
                  <p className="text-md">{selectedEmployee.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">القسم</p>
                  <p className="text-md">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">الحالة</p>
                  <Badge
                    variant={selectedEmployee.status === "active" ? "outline" : "secondary"}
                    className={
                      selectedEmployee.status === "active"
                        ? "bg-green-50 text-green-700 hover:bg-green-50"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }
                  >
                    {selectedEmployee.status === "active" ? "يعمل" : "منتهي"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">تاريخ التعيين</p>
                  <p className="text-md">{new Date(selectedEmployee.hire_date).toLocaleDateString("ar-SA")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">البريد الإلكتروني</p>
                  <p className="text-md">{selectedEmployee.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">رقم الهاتف</p>
                  <p className="text-md">{selectedEmployee.phone || "-"}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Employee Dialog */}
      {isEditDialogOpen && selectedEmployee && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent dir="rtl" className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الموظف</DialogTitle>
              <DialogDescription>
                تعديل بيانات {selectedEmployee.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium">
                    الاسم الكامل
                  </label>
                  <input
                    id="full_name"
                    defaultValue={selectedEmployee.full_name}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    المسمى الوظيفي
                  </label>
                  <input
                    id="position"
                    defaultValue={selectedEmployee.position}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    القسم
                  </label>
                  <input
                    id="department"
                    defaultValue={selectedEmployee.department}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={selectedEmployee.email || ""}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    رقم الهاتف
                  </label>
                  <input
                    id="phone"
                    defaultValue={selectedEmployee.phone || ""}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
            </form>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                // Here you would normally save the employee data
                console.log("Save employee data");
                setIsEditDialogOpen(false);
              }}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Employee Dialog */}
      {isDeleteDialogOpen && selectedEmployee && (
        <DeleteEmployeeDialog
          employee={selectedEmployee}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            // You might want to refresh the employees list here
            console.log("Employee deleted successfully");
          }}
        />
      )}
    </>
  );
}
