
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { EmployeeContract } from "@/hooks/hr/useEmployeeContracts";

interface ContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  contract?: EmployeeContract;
  onSave: (contract: any, file?: File) => Promise<void>;
}

export function ContractDialog({ isOpen, onClose, employeeId, contract, onSave }: ContractDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    startDate: contract?.start_date ? new Date(contract.start_date) : new Date(),
    endDate: contract?.end_date ? new Date(contract.end_date) : null,
    probationEndDate: contract?.probation_end_date ? new Date(contract.probation_end_date) : null,
    salary: contract?.salary || 0,
    contractType: contract?.contract_type || 'permanent',
    notes: contract?.notes || '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSize = file.size / 1024 / 1024; // size in MB
      if (fileSize > 10) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.");
        return;
      }
      setContractFile(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Format the dates for API
      const contractData = {
        employee_id: employeeId,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
        probation_end_date: formData.probationEndDate ? formData.probationEndDate.toISOString().split('T')[0] : null,
        salary: Number(formData.salary),
        contract_type: formData.contractType as 'permanent' | 'temporary' | 'contract',
        notes: formData.notes,
        status: 'active'
      };
      
      if (contract?.id) {
        await onSave({ id: contract.id, ...contractData }, contractFile || undefined);
      } else {
        await onSave(contractData, contractFile || undefined);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving contract:', error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatContractType = (type: string) => {
    switch (type) {
      case 'permanent': return 'دائم';
      case 'temporary': return 'مؤقت';
      case 'contract': return 'تعاقد';
      default: return type;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{contract ? 'تعديل العقد' : 'إضافة عقد جديد'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ بداية العقد</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, 'PPP', { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ نهاية العقد</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, 'PPP', { locale: ar })
                    ) : (
                      <span>غير محدد (دائم)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                    fromDate={formData.startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="probationEndDate">تاريخ انتهاء فترة التجربة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right font-normal"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.probationEndDate ? (
                    format(formData.probationEndDate, 'PPP', { locale: ar })
                  ) : (
                    <span>غير محدد</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.probationEndDate || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, probationEndDate: date }))}
                  initialFocus
                  fromDate={formData.startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">الراتب الشهري</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractType">نوع العقد</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value }))}
              >
                <SelectTrigger className="w-full">
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
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document">ملف العقد (PDF)</Label>
            <Input
              id="document"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {contract?.document_url && !contractFile && (
              <div className="text-sm text-muted-foreground mt-1">
                <a href={contract.document_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  عرض الملف الحالي
                </a>
              </div>
            )}
            {contractFile && (
              <div className="text-sm text-muted-foreground">
                تم اختيار: {contractFile.name}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارِ الحفظ...
                </>
              ) : contract ? 'تحديث العقد' : 'إضافة العقد'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

