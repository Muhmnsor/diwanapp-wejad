
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BudgetDistributionItem } from "./BudgetDistributionItem";
import { BudgetItem } from "./types";

interface BudgetDistributionProps {
  budgetItems: BudgetItem[];
  useDefaultPercentages: boolean;
  handleUseDefaultsChange: (value: string) => void;
  handleItemPercentageChange: (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  totalPercentage: number;
  isValidPercentages: boolean;
  totalAmount: number | "";
  totalObligationsAmount: number;
}

export const BudgetDistribution = ({
  budgetItems,
  useDefaultPercentages,
  handleUseDefaultsChange,
  handleItemPercentageChange,
  totalPercentage,
  isValidPercentages,
  totalAmount,
  totalObligationsAmount
}: BudgetDistributionProps) => {
  const netAmount = typeof totalAmount === "number" ? totalAmount - totalObligationsAmount : 0;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2 text-right">توزيع الميزانية</h3>
        <RadioGroup
          defaultValue="default"
          value={useDefaultPercentages ? "default" : "custom"}
          onValueChange={handleUseDefaultsChange}
          className="flex space-x-4 space-x-reverse justify-end mb-4"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">تخصيص يدوي</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default">النسب الافتراضية</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        {budgetItems.map((item) => (
          <BudgetDistributionItem
            key={item.id}
            item={item}
            isReadOnly={useDefaultPercentages}
            onPercentageChange={(e) => handleItemPercentageChange(item.id, e)}
          />
        ))}
      </div>

      <div className="pt-4 border-t flex justify-between items-center">
        <div className={`text-sm ${isValidPercentages ? "text-green-600" : "text-red-600"}`}>
          {isValidPercentages
            ? "النسب المئوية صحيحة"
            : "مجموع النسب المئوية يجب أن يساوي 100%"}
        </div>
        <div className="text-right font-medium">
          المجموع: {totalPercentage.toFixed(1)}%
        </div>
      </div>

      <div className="p-3 bg-secondary/20 border border-secondary/30 rounded-md">
        <p className="text-secondary-foreground font-medium text-right">
          المبلغ الصافي للتوزيع: {netAmount.toLocaleString()} ريال
        </p>
      </div>
    </div>
  );
};
