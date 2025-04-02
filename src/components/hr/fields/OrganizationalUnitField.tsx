
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";

interface OrganizationalUnitFieldProps {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function OrganizationalUnitField({ 
  value, 
  onChange, 
  label = "القسم",
  placeholder = "اختر القسم"
}: OrganizationalUnitFieldProps) {
  const { data: units, isLoading } = useOrganizationalUnits();
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  // Update the selected value when the value prop changes
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value || "");
    }
  }, [value, selectedValue]);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  // Filter units to only include departments
  const departments = units?.filter(unit => 
    unit.unit_type.toLowerCase() === 'department' && unit.is_active !== false
  ) || [];

  return (
    <div className="space-y-2">
      <Label htmlFor="department">{label}</Label>
      <Select
        value={selectedValue}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger id="department">
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {departments.length > 0 ? (
            departments.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              لا توجد أقسام متاحة
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
