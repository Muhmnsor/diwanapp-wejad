import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ActivityReportFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ActivityReportFormFields = ({ form }: ActivityReportFormFieldsProps) => {
  return (
    <>
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
      <FormField
        control={form.control}
        name="report_text"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea placeholder="نص التقرير" {...field} />
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
              <Textarea placeholder="التفاصيل" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
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
      <FormField
        control={form.control}
        name="activity_objectives"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="الأهداف" {...field} />
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
              <Input placeholder="الأثر على المشاركين" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};