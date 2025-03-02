
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OperationSelectorProps {
  operation: string;
  onOperationChange: (value: string) => void;
}

export const OperationSelector = ({
  operation,
  onOperationChange
}: OperationSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>نوع العملية:</Label>
      <RadioGroup
        value={operation}
        onValueChange={onOperationChange}
        className="flex gap-4"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="add" id="add" />
          <Label htmlFor="add">تمديد</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="subtract" id="subtract" />
          <Label htmlFor="subtract">تنقيص</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
