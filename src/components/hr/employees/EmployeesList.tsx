
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { AddEmployeeDialog } from "../dialogs/AddEmployeeDialog";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { EmployeesTable } from "./EmployeesTable";

interface EmployeesListProps {
  searchTerm?: string;
}

export function EmployeesList({ searchTerm = "" }: EmployeesListProps) {
  const [search, setSearch] = useState(searchTerm);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: employees, isLoading, error, refetch } = useEmployees();

  const filteredEmployees = employees?.filter(
    (employee) =>
      employee.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.position?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن موظف..."
            className="pl-9 pr-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة موظف
        </Button>
        
        <AddEmployeeDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onSuccess={() => {
            refetch();
            setIsAddDialogOpen(false);
          }} 
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeesTable employees={filteredEmployees} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
