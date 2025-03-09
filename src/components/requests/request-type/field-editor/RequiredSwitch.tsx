
import React from "react";
import { Switch } from "@/components/ui/switch";

interface RequiredSwitchProps {
  isRequired: boolean;
  onChange: (checked: boolean) => void;
}

export const RequiredSwitch = ({ isRequired, onChange }: RequiredSwitchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="field-required"
        checked={isRequired}
        onCheckedChange={onChange}
      />
      <label htmlFor="field-required" className="text-sm font-medium mr-2">مطلوب</label>
    </div>
  );
};
