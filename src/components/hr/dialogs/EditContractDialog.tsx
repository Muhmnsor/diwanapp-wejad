
import { useState, useEffect } from "react";
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
import { Loader2, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

// Define schema for contract form
const contractSchema = z.object({
  contract_type: z.enum(["permanent", "temporary", "contract"]),
  start_date: z.string().min(1, "تاريخ البدء مطلوب"),
  end_date: z.string().optional(),
  probation_end_date: z.string().optional(),
  salary: z.coerce.number().positive("الراتب يجب أن يكون أكبر من صفر"),
  status: z.enum(["active", "expired", "terminated"]),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface EditContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  employeeId: string;
  onSuccess?: () => void;
}

export function EditContractDialog({
  isOpen,
  onClose,
  contract,
  employeeId,
  onSuccess,
}: EditContractDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractDocument, setContractDocument] = useState<File | null>(null);
  const { updateContract, uploadContractDocument, isUploading } = useEmployeeContracts(employeeId);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_type: contract?.contract_type || "permanent",
      start_date: contract?.start_date ? format(new Date(contract.start_date), "yyyy-MM-dd") : "",
      end_date: contract?.end_date ? format(new Date(contract.end_date), "yyyy-MM-dd") : "",
      probation_end_date: contract?.probation_end_date ? format(new Date(contract.probation_end_date), "yyyy-MM-dd") : "",
      salary: contract?.salary || 0,
      status: contract?.status || "active",
    },
  });

  // Update form when contract changes
  useEffect(() => {
    if (contract) {
      form.reset({
        contract_type: contract.contract_type,
        start_date: contract.start_date ? format(new Date(contract.start_date), "yyyy-MM-dd") : "",
        end_date: contract.end_date ? format(new Date(contract.end_date), "yyyy-MM-dd") : "",
        probation_end_date: contract.probation_end_date ? format(new Date(contract.probation_end_date), "yyyy-MM-dd") : "",
        salary: contract.salary,
        status: contract.status,
      });
    }
  }, [contract, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setContractDocument(file);
  };

  const onSubmit = async (values: ContractFormValues) => {
    if (!contract?.id) return;
    
    setIsSubmitting(true);
    try {
      let documentUrl = contract.document_url;
      
      // Upload document if selected
      if (contractDocument) {
        documentUrl = await uploadContractDocument(contractDocument, contract.id);
      }
      
      // Update contract with document URL
      await updateContract({
        id: contract.id,
        ...values,
        document_url: documentUrl,
      });
      
      toast.success("تم تحديث العقد بنجاح");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error updating contract:", error);
      toast.error(error.message || "حدث خطأ أثناء تحديث العقد");
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
            <span>تعديل العقد</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                مستند العقد {contract?.document_url ? "(تغيير المستند)" : "(اختياري)"}
              </FormLabel>
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                disabled={isDisabled}
                className="cursor-pointer"
              />
              {contract?.document_url && (
                <div className="mt-2 text-sm text-blue-600">
                  <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                    فتح المستند الحالي
                  </a>
                </div>
              )}
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
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
