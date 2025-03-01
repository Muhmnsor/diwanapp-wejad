
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ResourceSourceFieldProps {
  resourceSource: string | undefined;
  handleSelectChange: (name: string, value: string) => void;
  show: boolean;
}

export const ResourceSourceField: React.FC<ResourceSourceFieldProps> = ({ 
  resourceSource, 
  handleSelectChange, 
  show 
}) => {
  if (!show) return null;

  // Available resource sources matching those in the resource form
  const resourceSources = [
    "منصات التمويل الجماعي",
    "الدعم الحكومي",
    "اشتراكات البرامج والفعاليات",
    "المؤسسات المانحة",
    "المسئولية الاجتماعية | الرعايات",
    "متجر الجمعية الكتروني",
    "التبرع عبر الرسائل",
    "الصدقة الالكترونية",
    "تبرعات عينية",
    "أخرى"
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="resource_source">مصدر المورد</Label>
      <Select
        value={resourceSource || ""}
        onValueChange={(value) => handleSelectChange("resource_source", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر مصدر المورد" />
        </SelectTrigger>
        <SelectContent>
          {resourceSources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
