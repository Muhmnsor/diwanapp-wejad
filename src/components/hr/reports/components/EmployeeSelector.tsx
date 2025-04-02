
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeSelectorProps {
  value: string | undefined;
  onChange: (employeeId: string | undefined) => void;
}

export function EmployeeSelector({ value, onChange }: EmployeeSelectorProps) {
  const { data: employees, isLoading } = useEmployees();
  
  if (isLoading) {
    return <Skeleton className="h-10 w-[250px]" />;
  }
  
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onChange(val === "all" ? undefined : val)}
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="اختر موظف..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">جميع الموظفين</SelectItem>
        {employees?.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
