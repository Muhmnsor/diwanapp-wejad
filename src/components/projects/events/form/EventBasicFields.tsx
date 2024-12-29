import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectActivityFormData } from "@/components/projects/activities/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventBasicFieldsProps {
  form: UseFormReturn<ProjectActivityFormData>;
}

export const EventBasicFields = ({ form }: EventBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان النشاط</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>وصف النشاط</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="max_attendees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الحد الأقصى للحضور</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="event_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع النشاط</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="in-person">حضوري</SelectItem>
                <SelectItem value="online">عن بعد</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>السعر</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="beneficiary_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع المستفيدين</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستفيدين" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="men">رجال</SelectItem>
                <SelectItem value="women">نساء</SelectItem>
                <SelectItem value="both">رجال ونساء</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="certificate_type"
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
                <SelectItem value="none">بدون شهادة</SelectItem>
                <SelectItem value="attendance">شهادة حضور</SelectItem>
                <SelectItem value="certified">شهادة معتمدة</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="event_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عدد ساعات النشاط</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};