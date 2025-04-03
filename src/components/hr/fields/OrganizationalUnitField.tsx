
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";

interface OrganizationalUnitFieldProps {
  form: any;
  name?: string;
  label?: string;
}

export function OrganizationalUnitField({ 
  form, 
  name = "department", 
  label = "القسم" 
}: OrganizationalUnitFieldProps) {
  const { data: units = [], isLoading } = useOrganizationalUnits();
  
  // Filter units to only include departments or divisions (can be adjusted as needed)
  const departmentUnits = units.filter(unit => 
    unit.unit_type === 'department' || unit.unit_type === 'division'
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                {departmentUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
