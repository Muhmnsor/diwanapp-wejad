
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { AddEmployeeDialog } from "../dialogs/AddEmployeeDialog";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { EmployeesTable } from "./EmployeesTable";
import { useQueryClient } from "@tanstack/react-query";

interface EmployeesListProps {
  searchTerm?: string;
}

export function EmployeesList({ searchTerm = "" }: EmployeesListProps) {
  const [search, setSearch] = useState(searchTerm);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: employees, isLoading, error } = useEmployees();

  const filteredEmployees = employees?.filter(
    (employee) =>
      employee.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.position?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department?.toLowerCase().includes(search.toLowerCase())
  );
  
  const refreshEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

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
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeesTable 
            employees={filteredEmployees} 
            isLoading={isLoading} 
            onRefresh={refreshEmployees}
          />
        </CardContent>
      </Card>
      
      <AddEmployeeDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refreshEmployees();
        }}
      />
    </div>
  );
}
