
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RequestType } from "./types";
import { DynamicForm } from "./DynamicForm";

interface NewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: RequestType;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const formSchema = z.object({
  title: z.string().min(5, {
    message: "يجب أن يحتوي العنوان على 5 أحرف على الأقل",
  }),
  priority: z.string(),
});

export const NewRequestDialog = ({
  isOpen,
  onClose,
  requestType,
  onSubmit,
  isSubmitting = false,
}: NewRequestDialogProps) => {
  const [step, setStep] = useState(1);
  const [requestData, setRequestData] = useState<{
    title: string;
    priority: string;
    form_data?: Record<string, any>;
  }>({
    title: "",
    priority: "medium",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      priority: "medium",
    },
  });

  const handleStep1Submit = (data: z.infer<typeof formSchema>) => {
    setRequestData({
      ...requestData,
      title: data.title,
      priority: data.priority,
    });
    setStep(2);
  };

  const handleStep2Submit = (formData: Record<string, any>) => {
    const fullData = {
      request_type_id: requestType.id,
      title: requestData.title,
      priority: requestData.priority,
      form_data: formData,
    };
    onSubmit(fullData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "معلومات الطلب الأساسية"
              : `${requestType.name} - تفاصيل الطلب`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "يرجى تقديم المعلومات الأساسية للطلب"
              : "يرجى تعبئة نموذج الطلب بالتفاصيل المطلوبة"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleStep1Submit)}
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
        ) : (
          <DynamicForm
            schema={requestType.form_schema}
            onSubmit={handleStep2Submit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
