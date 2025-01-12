import { Building2 } from "lucide-react";

export const EmptyDepartments = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد إدارات</h3>
      <p className="mt-2 text-sm text-gray-500">قم بإضافة إدارة جديدة للبدء</p>
    </div>
  );
};