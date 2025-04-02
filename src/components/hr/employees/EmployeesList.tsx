
import { useState } from "react";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmployeeCard } from "./EmployeeCard";
import { AddEmployeeDialog } from "../dialogs/AddEmployeeDialog";
import { EditEmployeeDialog } from "../dialogs/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../dialogs/DeleteEmployeeDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignScheduleDialog } from "../dialogs/AssignScheduleDialog";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import { useEmployeeSchedules } from "@/hooks/hr/useEmployeeSchedules";

export function EmployeesList() {
  const { data: employees, isLoading, error } = useEmployees();
  const { data: schedules } = useEmployeeSchedules();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [assignScheduleEmployeeId, setAssignScheduleEmployeeId] = useState<string | null>(null);
  const { data: permissions } = useHRPermissions();
  const canManageEmployees = permissions?.canManageEmployees || permissions?.isAdmin;

  const filteredEmployees = employees?.filter((employee) => {
    // Filter by tab
    if (activeTab !== "all" && employee.status !== activeTab) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        employee.full_name.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) || false ||
        employee.department?.toLowerCase().includes(query) || false ||
        employee.job_title?.toLowerCase().includes(query) || false
      );
    }
    return true;
  });

  // Find the schedule name for an employee
  const getScheduleName = (scheduleId?: string) => {
    if (!scheduleId) return null;
    const schedule = schedules?.find((s) => s.id === scheduleId);
    return schedule?.name || null;
  };

  // Get the editing employee name
  const getEditingEmployeeName = () => {
    if (!editingEmployeeId || !employees) return "";
    const employee = employees.find((emp) => emp.id === editingEmployeeId);
    return employee?.full_name || "";
  };

  // Get the deleting employee name
  const getDeletingEmployeeName = () => {
    if (!deletingEmployeeId || !employees) return "";
    const employee = employees.find((emp) => emp.id === deletingEmployeeId);
    return employee?.full_name || "";
  };

  // Get the employee name for schedule assignment
  const getAssignScheduleEmployeeName = () => {
    if (!assignScheduleEmployeeId || !employees) return "";
    const employee = employees.find((emp) => emp.id === assignScheduleEmployeeId);
    return employee?.full_name || "";
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن موظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 pl-4"
          />
        </div>
        {canManageEmployees && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="active">نشط</TabsTrigger>
          <TabsTrigger value="inactive">غير نشط</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">حدث خطأ أثناء تحميل بيانات الموظفين</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      ) : filteredEmployees?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">لا يوجد موظفين مطابقين لمعايير البحث</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees?.map((employee) => (
            <EmployeeCard
              key={employee.id}
              id={employee.id}
              name={employee.full_name}
              position={employee.job_title}
              department={employee.department}
              email={employee.email}
              phone={employee.phone}
              status={employee.status}
              scheduleName={getScheduleName(employee.schedule_id)}
              onEdit={canManageEmployees ? (id) => setEditingEmployeeId(id) : undefined}
              onDelete={canManageEmployees ? (id) => setDeletingEmployeeId(id) : undefined}
              onScheduleAssign={canManageEmployees ? (id) => setAssignScheduleEmployeeId(id) : undefined}
            />
          ))}
        </div>
      )}

      {canManageEmployees && (
        <>
          {/* Fix the dialog props */}
          <AddEmployeeDialog 
            isOpen={isAddDialogOpen} 
            onClose={() => setIsAddDialogOpen(false)} 
          />
          
          {editingEmployeeId && (
            <EditEmployeeDialog
              employee={editingEmployeeId}
              name={getEditingEmployeeName()}
              isOpen={!!editingEmployeeId}
              onClose={() => setEditingEmployeeId(null)}
            />
          )}
          
          {deletingEmployeeId && (
            <DeleteEmployeeDialog
              employee={deletingEmployeeId}
              name={getDeletingEmployeeName()}
              isOpen={!!deletingEmployeeId}
              onClose={() => setDeletingEmployeeId(null)}
            />
          )}
          
          {assignScheduleEmployeeId && (
            <AssignScheduleDialog
              employeeId={assignScheduleEmployeeId}
              employeeName={getAssignScheduleEmployeeName()}
              isOpen={!!assignScheduleEmployeeId}
              onClose={() => setAssignScheduleEmployeeId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
