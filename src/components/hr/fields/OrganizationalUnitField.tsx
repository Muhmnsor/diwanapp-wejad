import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useOrganizationalHierarchy, 
  OrganizationalHierarchyItem 
} from "@/hooks/hr/useOrganizationalHierarchy";

interface OrganizationalUnitFieldProps {
  value: string;
  onChange: (value: string, unitName?: string) => void;
  label?: string;
  required?: boolean;
}

export function OrganizationalUnitField({ 
  value, 
  onChange,
  label = "القسم",
  required = false
}: OrganizationalUnitFieldProps) {
  const [selectedUnitName, setSelectedUnitName] = useState<string>("");
  const { data: units, isLoading } = useOrganizationalHierarchy();
  
  // Find the selected unit name when value changes or units load
  useEffect(() => {
    if (value && units) {
      const unit = units.find(u => u.id === value);
      if (unit) {
        setSelectedUnitName(unit.name);
      }
    }
  }, [value, units]);
  
  const handleUnitSelect = (unitId: string) => {
    if (units) {
      const unit = units.find(u => u.id === unitId);
      if (unit) {
        setSelectedUnitName(unit.name);
        onChange(unit.id, unit.name);
      }
    }
  };
  
  // Format units for dropdown - add indentation based on level
  const formatUnitsForDropdown = (units: OrganizationalHierarchyItem[] | undefined) => {
    if (!units) return [];
    
    // First sort by path length and then by name to keep hierarchy visible
    return [...units].sort((a, b) => {
      // First sort by path length (hierarchy level)
      const levelDiff = a.path.length - b.path.length;
      if (levelDiff !== 0) return levelDiff;
      
      // Then sort alphabetically within the same level
      return a.name.localeCompare(b.name);
    });
  };
  
  const formattedUnits = formatUnitsForDropdown(units);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="department">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      
      <Select value={value} onValueChange={handleUnitSelect}>
        <SelectTrigger id="department" className="w-full text-right">
          <SelectValue placeholder="اختر الإدارة/القسم" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>جاري تحميل الهيكل التنظيمي...</SelectItem>
          ) : formattedUnits.length > 0 ? (
            formattedUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {/* Add indentation based on level */}
                {Array(unit.level).fill("—").join("")} {unit.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled>لم يتم العثور على وحدات تنظيمية</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
