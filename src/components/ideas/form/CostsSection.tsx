
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CostItem } from "../types";

interface CostsSectionProps {
  costs: CostItem[];
  totalCost: number;
  onCostChange: (index: number, field: keyof CostItem, value: number | string) => void;
  onAddCost: () => void;
}

export const CostsSection = ({
  costs,
  totalCost,
  onCostChange,
  onAddCost,
}: CostsSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-right block text-sm font-medium">
        جدول تكلفة الفكرة المتوقعة
      </label>
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-2 mb-2 font-medium text-right">
          <div>البند</div>
          <div>العدد</div>
          <div>التكلفة الإجمالية</div>
        </div>
        {costs.map((cost, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={cost.item}
              onChange={(e) => onCostChange(index, 'item', e.target.value)}
              className="text-right"
              placeholder="البند"
            />
            <Input
              type="number"
              value={cost.quantity}
              onChange={(e) => onCostChange(index, 'quantity', Number(e.target.value))}
              className="text-right"
              placeholder="العدد"
            />
            <Input
              type="number"
              value={cost.total_cost}
              onChange={(e) => onCostChange(index, 'total_cost', Number(e.target.value))}
              className="text-right"
              placeholder="التكلفة الإجمالية"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={onAddCost}
          className="w-full mb-2"
        >
          إضافة بند تكلفة
        </Button>
        <div className="text-left font-medium mt-4 p-2 bg-secondary rounded">
          إجمالي التكلفة: {totalCost.toLocaleString()} ريال
        </div>
      </div>
    </div>
  );
};
