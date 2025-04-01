import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useEmployeeContracts, EmployeeContract } from "@/hooks/hr/useEmployeeContracts";
import { toast } from "sonner";

interface ContractDialogProps {
  employeeId: string;
  contract?: EmployeeContract;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  onContractUpdated?: () => void;
}

export function ContractDialog({
  employeeId,
  contract,
  isEdit = false,
  trigger,
  onContractUpdated,
}: ContractDialogProps) {
  const [open, setOpen] = useState(false);
  const { createContract, updateContract, isUploading, uploadContractDocument } = useEmployeeContracts(employeeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    probationEndDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    salary: 0,
    contractType: "permanent" as "permanent" | "temporary" | "contract",
    notes: "",
  });

  useEffect(() => {
    if (contract && isEdit) {
      setFormData({
        startDate: new Date(contract.start_date),
        endDate: contract.end_date ? new Date(contract.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 12)),
        probationEndDate: contract.probation_end_date 
          ? new Date(contract.probation_end_date) 
          : new Date(new Date().setMonth(new Date().getMonth() + 3)),
        salary: contract.salary || 0,
        contractType: contract.contract_type as "permanent" | "temporary" | "contract",
        notes: contract.notes || "",
      });
    }
  }, [contract, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format dates to strings for the API
      const startDateStr = formData.startDate.toISOString().split("T")[0];
      const endDateStr = formData.endDate.toISOString().split("T")[0];
      const probationEndDateStr = formData.probationEndDate.toISOString().split("T")[0];

      let documentUrl = contract?.document_url || null;

      // Upload the document if a file was selected
      if (contractFile) {
        const contractId = contract?.id || "new";
        documentUrl = await uploadContractDocument(contractFile, contractId);
      }

      if (isEdit && contract) {
        // Update existing contract
        await updateContract({
          id: contract.id,
          start_date: startDateStr,
          end_date: endDateStr,
          probation_end_date: probationEndDateStr,
          salary: formData.salary,
          contract_type: formData.contractType,
          document_url: documentUrl,
          notes: formData.notes,
        });
        toast.success("تم تحديث العقد بنجاح");
      } else {
        // Create new contract
        await createContract({
          employee_id: employeeId,
          start_date: startDateStr,
          end_date: endDateStr,
          probation_end_date: probationEndDateStr,
          salary: formData.salary,
          contract_type: formData.contractType,
          document_url: documentUrl,
          status: "active",
          notes: formData.notes,
        });
        toast.success("تم إنشاء العقد بنجاح");
      }

      if (onContractUpdated) {
        onContractUpdated();
      }
      setOpen(false);
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
    }
  };

  const handleContractTypeChange = (value: "permanent" | "temporary" | "contract") => {
    setFormData(prev => ({
      ...prev,
      contractType: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>{isEdit ? "تعديل العقد" : "إضافة عقد"}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل العقد" : "إضافة عقد جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البدء</Label>
              <DatePicker
                date={formData.startDate}
                setDate={(date) => setFormData(prev => ({ ...prev, startDate: date || new Date() }))}
                locale="ar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ الانتهاء</Label>
              <DatePicker
                date={formData.endDate}
                setDate={(date) => setFormData(prev => ({ ...prev, endDate: date || new Date() }))}
                locale="ar"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="probationEndDate">تاريخ انتهاء فترة التجربة</Label>
            <DatePicker
              date={formData.probationEndDate}
              setDate={(date) => setFormData(prev => ({ ...prev, probationEndDate: date || new Date() }))}
              locale="ar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">الراتب</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractType">نوع العقد</Label>
              <Select
                value={formData.contractType}
                onValueChange={handleContractTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">دائم</SelectItem>
                  <SelectItem value="temporary">مؤقت</SelectItem>
                  <SelectItem value="contract">تعاقد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrl">نسخة العقد (اختياري)</Label>
            <Input
              id="documentUrl"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            {contract?.document_url && (
              <div className="text-sm text-blue-600">
                <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                  عرض العقد الحالي
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? "جاري الحفظ..." : (isEdit ? "تحديث" : "إضافة")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
