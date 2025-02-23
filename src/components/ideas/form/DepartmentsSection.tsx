
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Department } from "../types";

interface DepartmentsSectionProps {
  departments: Department[];
  onDepartmentChange: (index: number, field: keyof Department, value: string) => void;
  onAddDepartment: () => void;
}

export const DepartmentsSection = ({
  departments,
  onDepartmentChange,
  onAddDepartment,
}: DepartmentsSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-right block text-sm font-medium">
        الإدارات والوحدات المساهمة
      </label>
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 mb-2 font-medium text-right">
          <div>اسم الإدارة/الوحدة</div>
          <div>المساهمة المتوقعة</div>
        </div>
        {departments.map((department, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={department.name}
              onChange={(e) => onDepartmentChange(index, 'name', e.target.value)}
              className="text-right"
              placeholder="اسم الإدارة/الوحدة"
            />
            <Input
              value={department.contribution}
              onChange={(e) => onDepartmentChange(index, 'contribution', e.target.value)}
              className="text-right"
              placeholder="المساهمة المتوقعة"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={onAddDepartment}
          className="w-full mt-2"
        >
          إضافة إدارة/وحدة
        </Button>
      </div>
    </div>
  );
};
