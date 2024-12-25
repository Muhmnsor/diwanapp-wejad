import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface EventCertificateFieldsProps {
  form: UseFormReturn<any>;
}

export const EventCertificateFields = ({ form }: EventCertificateFieldsProps) => {
  const watchCertificateType = form.watch("certificateType");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="certificateType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع الشهادة</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الشهادة" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="attendance">شهادة حضور</SelectItem>
                <SelectItem value="certified">شهادة معتمدة</SelectItem>
                <SelectItem value="none">بدون شهادة</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchCertificateType !== "none" && (
        <FormField
          control={form.control}
          name="eventHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عدد ساعات الفعالية</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="أدخل عدد الساعات"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};