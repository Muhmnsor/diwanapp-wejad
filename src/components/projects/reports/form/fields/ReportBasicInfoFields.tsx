import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";

interface ReportBasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const ReportBasicInfoFields = ({ form }: ReportBasicInfoFieldsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="program_name"
          render={({ field }) => (
            <FormItem>
              <Label>اسم البرنامج</Label>
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
              <Label>اسم التقرير</Label>
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
              <Label>نص التقرير</Label>
              <FormControl>
                <Input placeholder="نص التقرير" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};