
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";

interface DepartmentFieldProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function DepartmentField({ value, onChange }: DepartmentFieldProps) {
  const { data: organizationalUnits, isLoading } = useOrganizationalUnits();
  
  // Filter only departments
  const departments = organizationalUnits?.filter(unit => 
    unit.unit_type === 'department' || unit.unit_type === 'قسم'
  ) || [];

  // Handle edge case where value is empty string
  const safeValue = value === "" ? undefined : value || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="department">القسم</Label>
      <Select
        value={safeValue}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger id="department">
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر القسم"} />
        </SelectTrigger>
        <SelectContent>
          {departments.length > 0 ? (
            departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no_departments">لا توجد أقسام</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
