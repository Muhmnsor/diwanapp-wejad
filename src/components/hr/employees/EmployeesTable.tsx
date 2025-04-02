
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/dateTimeUtils';
import { Badge } from '@/components/ui/badge';

interface Employee {
  id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  email?: string;
  phone?: string;
  status?: string;
  hire_date?: string;
}

interface EmployeesTableProps {
  employees?: Employee[];
  isLoading: boolean;
}

export function EmployeesTable({ employees, isLoading }: EmployeesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        لا يوجد موظفين للعرض
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">الاسم</TableHead>
            <TableHead>المسمى الوظيفي</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>تاريخ التعيين</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>{employee.job_title || "-"}</TableCell>
              <TableCell>{employee.department || "-"}</TableCell>
              <TableCell>{employee.email || "-"}</TableCell>
              <TableCell>{employee.phone || "-"}</TableCell>
              <TableCell>{employee.hire_date ? formatDate(employee.hire_date) : "-"}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    employee.status === "active" ? "default" : 
                    employee.status === "inactive" ? "secondary" : 
                    employee.status === "leave" ? "outline" : "secondary"
                  }
                >
                  {employee.status === "active" ? "نشط" : 
                   employee.status === "inactive" ? "غير نشط" : 
                   employee.status === "leave" ? "إجازة" : employee.status || "-"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
