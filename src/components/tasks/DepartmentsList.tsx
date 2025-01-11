import { Department } from "@/types/department";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentsListProps {
  departments: Department[];
}

export const DepartmentsList = ({ departments }: DepartmentsListProps) => {
  if (!departments.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">لا توجد إدارات أو وحدات مضافة</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((department) => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
};