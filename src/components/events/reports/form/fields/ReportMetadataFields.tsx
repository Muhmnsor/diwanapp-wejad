import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventReportFormData } from "@/types/eventReport";

interface ReportMetadataFieldsProps {
  form: UseFormReturn<EventReportFormData>;
}

export const ReportMetadataFields = ({ form }: ReportMetadataFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="activity_duration"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="مدة النشاط" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="attendees_count"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="عدد المشاركين" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};