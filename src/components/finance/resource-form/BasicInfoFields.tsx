
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
}

export const BasicInfoFields = ({
  totalAmount,
  obligationsAmount,
  handleTotalAmountChange,
  handleObligationsChange,
}: BasicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="source">مصدر المورد</Label>
        <Input id="source" placeholder="مثال: منحة، تبرع، إيرادات" required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">نوع المورد</Label>
        <Select defaultValue="unbound">
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
        <Input id="entity" placeholder="الجهة التي جاء منها المورد" required />
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
        />
      </div>
    </div>
  );
};
