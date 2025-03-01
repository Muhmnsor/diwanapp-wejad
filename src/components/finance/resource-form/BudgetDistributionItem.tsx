
import { Input } from "@/components/ui/input";

interface BudgetDistributionItemProps {
  name: string;
  percentage: number;
  value: number;
  onPercentageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const BudgetDistributionItem = ({
  name,
  percentage,
  value,
  onPercentageChange,
  disabled = false,
}: BudgetDistributionItemProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-2">
      <div className="flex items-center">{name}</div>
      <div>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={percentage}
          onChange={onPercentageChange}
          disabled={disabled}
          className="text-right"
        />
      </div>
      <div>
        <Input 
          value={value.toLocaleString()} 
          readOnly 
          disabled 
          className="text-right"
        />
      </div>
    </div>
  );
};
