import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormData } from "@/types/eventReport";

interface ReportObjectivesFieldsProps {
  form: UseFormReturn<EventReportFormData>;
}

export const ReportObjectivesFields = ({ form }: ReportObjectivesFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="activity_objectives"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="الأهداف" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="impact_on_participants"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="الأثر على المشاركين" 
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