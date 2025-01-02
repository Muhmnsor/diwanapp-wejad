import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormData } from "@/types/eventReport";

interface ReportBasicFieldsProps {
  form: UseFormReturn<EventReportFormData>;
}

export const ReportBasicFields = ({ form }: ReportBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="program_name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="اسم البرنامج" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="report_name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="اسم التقرير" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};