
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
import { Loader2 } from "lucide-react";
import { RequestType } from "./types";
import { DynamicForm } from "./DynamicForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: RequestType;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
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
  isUploading = false,
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

  const handleStep1Submit = (data: z.infer<typeof formSchema>) => {
    setRequestData({
      ...requestData,
      title: data.title,
      priority: data.priority,
    });
    setStep(2);
  };

  const handleStep2Submit = (formData: Record<string, any>) => {
    try {
      setError(null);
      const fullData = {
        request_type_id: requestType.id,
        title: requestData.title,
        priority: requestData.priority,
        form_data: formData,
      };
      onSubmit(fullData);
    } catch (err) {
      console.error("Error submitting request:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء إرسال الطلب");
      }
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    // Reset form and state when closing
    form.reset();
    setRequestData({
      title: "",
      priority: "medium",
    });
    setStep(1);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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

        {error && (
          <Alert variant="destructive">
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
          <DynamicForm
            schema={requestType.form_schema}
            onSubmit={handleStep2Submit}
            onBack={handleBack}
            isSubmitting={isSubmitting || isUploading}
          />
        )}

        {(isSubmitting || isUploading) && (
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            {isUploading ? "جاري رفع الملفات..." : "جاري معالجة الطلب..."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
