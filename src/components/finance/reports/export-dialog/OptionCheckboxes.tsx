
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface OptionCheckbox {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  showIf?: boolean;
}

interface OptionCheckboxesProps {
  options: OptionCheckbox[];
}

export const OptionCheckboxes: React.FC<OptionCheckboxesProps> = ({ options }) => {
  return (
    <>
      {options.map((option) => 
        option.showIf !== false && (
          <div key={option.id} className="flex items-center gap-2 justify-end">
            <Checkbox
              id={option.id}
              checked={option.checked}
              onCheckedChange={(checked) => 
                option.onChange(checked === true)
              }
            />
            <Label htmlFor={option.id} className="text-right">
              {option.label}
            </Label>
          </div>
        )
      )}
    </>
  );
};
