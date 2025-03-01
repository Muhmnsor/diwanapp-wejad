
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoFieldsProps {
  totalAmount: number | "";
  obligationsAmount: number | "";
  handleTotalAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleObligationsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  source: string;
  handleSourceChange: (value: string) => void;
  defaultType?: string;
  defaultEntity?: string;
}

export const BasicInfoFields = ({
  totalAmount,
  obligationsAmount,
  handleTotalAmountChange,
  handleObligationsChange,
  source,
  handleSourceChange,
  defaultType = "unbound",
  defaultEntity = "",
}: BasicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
      <div className="space-y-2">
        <Label htmlFor="source">مصدر المورد</Label>
        <Select value={source} onValueChange={handleSourceChange} dir="rtl">
          <SelectTrigger>
            <SelectValue placeholder="اختر مصدر المورد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="منصات التمويل الجماعي">منصات التمويل الجماعي</SelectItem>
            <SelectItem value="الدعم الحكومي">الدعم الحكومي</SelectItem>
            <SelectItem value="اشتراكات البرامج والفعاليات">اشتراكات البرامج والفعاليات</SelectItem>
            <SelectItem value="المؤسسات المانحة">المؤسسات المانحة</SelectItem>
            <SelectItem value="المسئولية الاجتماعية | الرعايات">المسئولية الاجتماعية | الرعايات</SelectItem>
            <SelectItem value="متجر الجمعية الكتروني">متجر الجمعية الكتروني</SelectItem>
            <SelectItem value="التبرع عبر الرسائل">التبرع عبر الرسائل</SelectItem>
            <SelectItem value="الصدقة الالكترونية">الصدقة الالكترونية</SelectItem>
            <SelectItem value="تبرعات عينية">تبرعات عينية</SelectItem>
            <SelectItem value="أخرى">أخرى</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">نوع المورد</Label>
        <Select defaultValue={defaultType} dir="rtl">
          <SelectTrigger id="type">
            <SelectValue placeholder="اختر نوع المورد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bound">مقيد</SelectItem>
            <SelectItem value="unbound">غير مقيد</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="entity">الجهة</Label>
        <Input 
          id="entity" 
          placeholder="الجهة التي جاء منها المورد" 
          required 
          className="text-right" 
          defaultValue={defaultEntity}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="totalAmount">المبلغ الإجمالي (ريال)</Label>
        <Input
          id="totalAmount"
          type="number"
          min="0"
          step="0.01"
          value={totalAmount}
          onChange={handleTotalAmountChange}
          required
          className="text-right"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="obligationsAmount">الالتزامات (ريال)</Label>
        <Input
          id="obligationsAmount"
          type="number"
          min="0"
          step="0.01"
          value={obligationsAmount}
          onChange={handleObligationsChange}
          className="text-right"
        />
      </div>
      
      <div className="space-y-2">
        <Label>صافي المبلغ (ريال)</Label>
        <Input
          value={
            typeof totalAmount === "number" && typeof obligationsAmount === "number"
              ? (totalAmount - obligationsAmount).toLocaleString()
              : ""
          }
          readOnly
          disabled
          className="text-right"
        />
      </div>
    </div>
  );
};
