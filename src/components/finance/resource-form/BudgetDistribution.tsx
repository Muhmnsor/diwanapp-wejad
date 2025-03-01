
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BudgetItem } from "./types";
import { Separator } from "@/components/ui/separator";
import { BudgetDistributionItem } from "./BudgetDistributionItem";

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
  obligationsAmount: number | "";
}

export const BudgetDistribution = ({
  budgetItems,
  useDefaultPercentages,
  handleUseDefaultsChange,
  handleItemPercentageChange,
  totalPercentage,
  isValidPercentages,
  totalAmount,
  obligationsAmount,
}: BudgetDistributionProps) => {
  return (
    <>
      <Separator />

      <div className="text-right">
        <Label>توزيع المبلغ على البنود</Label>
        <div className="mt-2">
          <RadioGroup defaultValue="default" onValueChange={handleUseDefaultsChange} dir="rtl">
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">استخدام النسب الافتراضية</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">إدخال النسب يدويًا</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="border rounded-lg p-4 text-right overflow-x-auto">
        <div className="grid grid-cols-3 gap-4 mb-4 font-bold min-w-[500px]">
          <div>البند</div>
          <div>النسبة المئوية</div>
          <div>القيمة (ريال)</div>
        </div>

        {budgetItems.map((item) => (
          <BudgetDistributionItem
            key={item.id}
            name={item.name}
            percentage={item.percentage}
            value={item.value}
            onPercentageChange={(e) => handleItemPercentageChange(item.id, e)}
            disabled={useDefaultPercentages}
          />
        ))}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t font-bold min-w-[500px]">
          <div>الإجمالي</div>
          <div
            className={
              !useDefaultPercentages && !isValidPercentages
                ? "text-red-500"
                : ""
            }
          >
            {totalPercentage.toFixed(1)}%
          </div>
          <div>
            {typeof totalAmount === "number" && typeof obligationsAmount === "number"
              ? (totalAmount - obligationsAmount).toLocaleString()
              : "0"}
            {" ريال"}
          </div>
        </div>

        {!useDefaultPercentages && !isValidPercentages && (
          <p className="text-red-500 mt-2 text-sm">
            مجموع النسب المئوية يجب أن يكون 100% (القيمة الحالية: {totalPercentage.toFixed(1)}%)
          </p>
        )}
      </div>
    </>
  );
};
