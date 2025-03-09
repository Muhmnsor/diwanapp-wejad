
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const formSchema = z.object({
  title: z.string().min(5, {
    message: "يجب أن يحتوي العنوان على 5 أحرف على الأقل",
  }),
  priority: z.string(),
});

export type RequestBasicInfo = z.infer<typeof formSchema>;

interface RequestBasicInfoFormProps {
  onSubmit: (data: RequestBasicInfo) => void;
  initialValues?: RequestBasicInfo;
}

export const RequestBasicInfoForm = ({
  onSubmit,
  initialValues = { title: "", priority: "medium" },
}: RequestBasicInfoFormProps) => {
  const form = useForm<RequestBasicInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان الطلب</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان الطلب" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>أولوية الطلب</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر أولوية" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">التالي</Button>
        </div>
      </form>
    </Form>
  );
};
