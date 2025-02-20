
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormValues } from "../types";

interface ReportMetricsFieldsProps {
  form: UseFormReturn<EventReportFormValues>;
}

export const ReportMetricsFields = ({ form }: ReportMetricsFieldsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="attendees_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عدد الحضور</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="absent_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عدد الغائبين</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="satisfaction_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>مستوى الرضا (1-5)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                {...field} 
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
