
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { formatFormError } from "../types/meetingTypes";

interface MeetingBasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const MeetingBasicInfoFields = ({ form }: MeetingBasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>عنوان الاجتماع</FormLabel>
            <FormControl>
              <Input placeholder="أدخل عنوان الاجتماع" {...field} />
            </FormControl>
            {fieldState.error && (
              <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
            )}
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="meeting_type"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>نوع الاجتماع</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الاجتماع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="board">اجتماع مجلس الإدارة</SelectItem>
                  <SelectItem value="general_assembly">الجمعية العمومية</SelectItem>
                  <SelectItem value="committee">اجتماع لجنة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
              )}
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ الاجتماع</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                setDate={(date) => field.onChange(date?.toISOString().split('T')[0])}
              />
              {fieldState.error && (
                <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_time"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>وقت البدء</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
              )}
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>مدة الاجتماع (بالدقائق)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
              )}
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="attendance_type"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>نوع الحضور</FormLabel>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحضور" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="in_person">حضوري</SelectItem>
                <SelectItem value="remote">عن بعد</SelectItem>
                <SelectItem value="hybrid">مختلط</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.error && (
              <FormMessage>{formatFormError(fieldState.error)}</FormMessage>
            )}
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>أهداف الاجتماع</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="أدخل أهداف وتفاصيل الاجتماع"
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
