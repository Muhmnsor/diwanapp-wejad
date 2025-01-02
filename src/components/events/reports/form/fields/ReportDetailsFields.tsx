import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormData } from "@/types/eventReport";

interface ReportDetailsFieldsProps {
  form: UseFormReturn<EventReportFormData>;
}

export const ReportDetailsFields = ({ form }: ReportDetailsFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="report_text"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="نص التقرير" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detailed_description"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="التفاصيل" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};