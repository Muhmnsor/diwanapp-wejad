
import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
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

  // Reset form state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      form.reset({
        title: "",
        priority: "medium",
      });
      setRequestData({
        title: "",
        priority: "medium",
      });
    }
  }, [isOpen, form]);

  const handleStep1Submit = (data: z.infer<typeof formSchema>) => {
    try {
      setRequestData({
        ...requestData,
        title: data.title,
        priority: data.priority,
      });
      setStep(2);
      setError(null);
    } catch (err) {
      console.error("Error in step 1:", err);
      setError("حدث خطأ أثناء معالجة البيانات. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleStep2Submit = (formData: Record<string, any>) => {
    try {
      const fullData = {
        request_type_id: requestType.id,
        title: requestData.title,
        priority: requestData.priority,
        form_data: formData,
      };
      onSubmit(fullData);
      setError(null);
    } catch (err) {
      console.error("Error in step 2:", err);
      setError("حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.");
    }
  };

  // Function to check if form schema exists and is valid
  const isFormSchemaValid = () => {
    return requestType && 
           requestType.form_schema && 
           requestType.form_schema.fields && 
           Array.isArray(requestType.form_schema.fields);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "معلومات الطلب الأساسية"
              : `${requestType?.name || 'طلب جديد'} - تفاصيل الطلب`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "يرجى تقديم المعلومات الأساسية للطلب"
              : "يرجى تعبئة نموذج الطلب بالتفاصيل المطلوبة"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
          <>
            {isFormSchemaValid() ? (
              <DynamicForm
                schema={requestType.form_schema}
                onSubmit={handleStep2Submit}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md">
                <p className="text-red-500">
                  لا يمكن تحميل نموذج الطلب. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
                </p>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    العودة
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
