
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";

interface OrganizationalUnitFieldProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function OrganizationalUnitField({ value, onChange }: OrganizationalUnitFieldProps) {
  const { data: units, isLoading } = useOrganizationalUnits();
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  // Filter units to only include departments (or any other type you want to use)
  const departments = units?.filter(unit => unit.unit_type === 'department' || unit.unit_type === 'قسم') || [];

  // Update the selected value when the parent component updates the value
  useEffect(() => {
    if (value !== undefined && value !== null && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value, selectedValue]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="department">القسم</Label>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={isLoading}
      >
        <SelectTrigger id="department">
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر القسم"} />
        </SelectTrigger>
        <SelectContent>
          {departments.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
