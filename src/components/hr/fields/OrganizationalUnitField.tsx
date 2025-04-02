
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  useOrganizationalHierarchy, 
  OrganizationalHierarchyItem 
} from "@/hooks/hr/useOrganizationalHierarchy";
import { OrganizationTreeView } from "@/components/hr/organization/OrganizationTreeView";

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
  const [isOpen, setIsOpen] = useState(false);
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
  
  const handleUnitSelect = (unit: OrganizationalHierarchyItem) => {
    setSelectedUnitName(unit.name);
    onChange(unit.id, unit.name);
    setIsOpen(false);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="department">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-right"
            type="button"
          >
            <span className="truncate">
              {selectedUnitName || "اختر الإدارة/القسم"}
            </span>
            <Building2 className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px] sm:w-[450px] overflow-y-auto">
          <SheetHeader className="text-right mb-4">
            <SheetTitle>اختر الإدارة أو القسم</SheetTitle>
          </SheetHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>جاري تحميل الهيكل التنظيمي...</p>
            </div>
          ) : units && units.length > 0 ? (
            <OrganizationTreeView 
              units={units}
              onUnitClick={handleUnitSelect}
              selectedUnitId={value}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">لم يتم العثور على وحدات تنظيمية</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
