
import { EmployeesList } from "@/components/hr/employees/EmployeesList";

const HREmployees = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
        <p className="text-muted-foreground">عرض وإدارة بيانات الموظفين والعقود</p>
      </div>
      
      <EmployeesList />
    </div>
  );
};

export default HREmployees;
