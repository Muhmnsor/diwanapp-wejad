import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrganizationalUnitEmployees } from "@/hooks/hr/useOrganizationalUnitEmployees";
import { useEmployees } from "@/hooks/hr/useEmployees";

interface EmployeeReportTableProps {
  unitId: string;
  unitType: string;
}

export function EmployeeReportTable({ unitId, unitType }: EmployeeReportTableProps) {
  const { data: unitEmployees, isLoading: unitLoading } = useOrganizationalUnitEmployees(unitId !== "all" ? unitId : "");
  const { data: allEmployees, isLoading: allLoading } = useEmployees();
  
  const isLoading = unitId === "all" ? allLoading : unitLoading;
  const employees = unitId === "all" ? allEmployees : unitEmployees?.map(assignment => assignment.employee);
  
  if (isLoading) {
    return <div className="flex justify-center p-4">جاري تحميل البيانات...</div>;
  }

  if (!employees || employees.length === 0) {
    return <div className="text-center p-4">لا يوجد موظفين في هذه الوحدة</div>;
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
            <TableCell>
              {employee.hire_date 
                ? new Date(employee.hire_date).toLocaleDateString("ar-SA")
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

