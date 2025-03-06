
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSource, setCustomSource] = useState("");

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

  // Check if resourceSource is not in standard list
  useEffect(() => {
    if (resourceSource && !resourceSources.includes(resourceSource)) {
      setShowCustomInput(true);
      setCustomSource(resourceSource);
      handleSelectChange("resource_source", "أخرى");
    } else {
      setShowCustomInput(resourceSource === "أخرى");
    }
  }, [resourceSource]);

  const handleSourceChange = (value: string) => {
    handleSelectChange("resource_source", value);
    setShowCustomInput(value === "أخرى");
    
    // If changing from "أخرى" to another option, clear the custom input
    if (value !== "أخرى") {
      setCustomSource("");
    }
  };

  const handleCustomSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSource(value);
    // Update the resource_source in parent component
    if (value.trim()) {
      handleSelectChange("resource_source", value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="resource_source">مصدر المورد</Label>
      <Select
        value={showCustomInput ? "أخرى" : (resourceSource || "")}
        onValueChange={handleSourceChange}
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

      {showCustomInput && (
        <div className="mt-2">
          <Label htmlFor="custom_source">المصدر المخصص</Label>
          <Input
            id="custom_source"
            value={customSource}
            onChange={handleCustomSourceChange}
            placeholder="ادخل مصدر المورد"
            className="text-right mt-1"
          />
        </div>
      )}
    </div>
  );
};
