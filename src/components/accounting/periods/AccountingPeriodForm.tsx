
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccountingPeriodOperations } from "@/hooks/accounting/useAccountingPeriodOperations";
import { AccountingPeriod } from "@/hooks/accounting/useAccountingPeriods";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountingPeriodFormProps {
  period?: AccountingPeriod;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AccountingPeriodForm = ({ period, onCancel, onSuccess }: AccountingPeriodFormProps) => {
  const { toast } = useToast();
  const { createPeriod, updatePeriod, isLoading } = useAccountingPeriodOperations();
  
  const [formData, setFormData] = useState({
    name: period?.name || "",
    start_date: period?.start_date ? new Date(period.start_date) : new Date(),
    end_date: period?.end_date ? new Date(period.end_date) : new Date(),
    is_closed: period?.is_closed !== undefined ? period.is_closed : false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.start_date > formData.end_date) {
      toast({
        title: "خطأ في تواريخ الفترة",
        description: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
        variant: "destructive",
      });
      return;
    }

    try {
      const periodData = {
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
      };
      
      if (period?.id) {
        await updatePeriod(period.id, periodData);
        toast({
          title: "تم تحديث الفترة المحاسبية",
          description: "تم تحديث بيانات الفترة المحاسبية بنجاح",
        });
      } else {
        await createPeriod(periodData);
        toast({
          title: "تم إنشاء الفترة المحاسبية",
          description: "تم إضافة الفترة المحاسبية الجديدة بنجاح",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving accounting period:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="space-y-2">
        <Label htmlFor="name">اسم الفترة المحاسبية</Label>
        <Input
          id="name"
          name="name"
          placeholder="مثال: السنة المالية 2025"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تاريخ البداية</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.start_date ? format(formData.start_date, "yyyy-MM-dd") : <span>اختر تاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) => handleDateChange("start_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>تاريخ النهاية</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : <span>اختر تاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) => handleDateChange("end_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : period ? "تحديث الفترة" : "إضافة فترة جديدة"}
        </Button>
      </div>
    </form>
  );
};
