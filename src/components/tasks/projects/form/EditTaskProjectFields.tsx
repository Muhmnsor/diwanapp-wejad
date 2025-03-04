
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EditTaskProjectFieldsProps {
  form: UseFormReturn<{
    name: string;
    description: string;
    project_manager: string;
    start_date: string;
    end_date: string;
  }>;
  managers?: { id: string; name: string }[];
}

export const EditTaskProjectFields = ({ form, managers = [] }: EditTaskProjectFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="name" className="text-right block">اسم المشروع</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="أدخل اسم المشروع"
                  required
                  className="text-right"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="description" className="text-right block">وصف المشروع</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف المشروع"
                  rows={4}
                  className="text-right"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="project_manager"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="project_manager" className="text-right block">مدير المشروع</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر مدير المشروع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {managers.length > 0 ? (
                    managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-manager" value="no-manager">
                      لا يوجد مدراء متاحين
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="space-y-2 md:order-1">
              <FormLabel htmlFor="start_date" className="text-right block">تاريخ البداية</FormLabel>
              <FormControl>
                <Input
                  id="start_date"
                  type="date"
                  className="text-right"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="space-y-2 md:order-2">
              <FormLabel htmlFor="end_date" className="text-right block">تاريخ النهاية</FormLabel>
              <FormControl>
                <Input
                  id="end_date"
                  type="date"
                  className="text-right"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
