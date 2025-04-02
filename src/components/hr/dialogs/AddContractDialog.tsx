
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

// Define schema for contract form
const contractSchema = z.object({
  contract_type: z.enum(["permanent", "temporary", "contract"]),
  start_date: z.string().min(1, "تاريخ البدء مطلوب"),
  end_date: z.string().optional(),
  probation_end_date: z.string().optional(),
  salary: z.coerce.number().positive("الراتب يجب أن يكون أكبر من صفر"),
  status: z.enum(["active", "expired", "terminated"]).default("active"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface AddContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  onSuccess?: () => void;
}

export function AddContractDialog({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}: AddContractDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractDocument, setContractDocument] = useState<File | null>(null);
  const { createContract, uploadContractDocument, isUploading } = useEmployeeContracts(employeeId);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_type: "permanent",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      probation_end_date: "",
      salary: 0,
      status: "active",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setContractDocument(file);
  };

  const onSubmit = async (values: ContractFormValues) => {
    setIsSubmitting(true);
    try {
      let documentUrl = null;
      
      // Upload document if selected
      if (contractDocument) {
        documentUrl = await uploadContractDocument(contractDocument, employeeId);
      }
      
      // Create contract with document URL
      await createContract({
        employee_id: employeeId,
        ...values,
        document_url: documentUrl,
        renewal_reminder_sent: false,
      });
      
      toast.success("تم إضافة العقد بنجاح");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة العقد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>إضافة عقد جديد</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <h3 className="font-medium">الموظف: {employeeName}</h3>
            </div>

            <FormField
              control={form.control}
              name="contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع العقد</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العقد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">دائم</SelectItem>
                      <SelectItem value="temporary">مؤقت</SelectItem>
                      <SelectItem value="contract">تعاقد</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ البدء</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الانتهاء</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ""} 
                      disabled={isDisabled || form.watch("contract_type") === "permanent"} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="probation_end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ انتهاء فترة التجربة</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ""}
                      disabled={isDisabled} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الراتب</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...field} 
                      disabled={isDisabled} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة العقد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">ساري</SelectItem>
                      <SelectItem value="expired">منتهي</SelectItem>
                      <SelectItem value="terminated">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel htmlFor="document" className="block mb-2">
                مستند العقد (اختياري)
              </FormLabel>
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                disabled={isDisabled}
                className="cursor-pointer"
              />
            </div>

            <DialogFooter className="flex justify-between sm:justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isDisabled}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isDisabled}>
                {isDisabled && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إضافة العقد
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
