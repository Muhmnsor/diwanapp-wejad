
import { Checkbox } from "@/components/ui/checkbox";
import { ExportOptionsProps } from "./types";

export const ExportOptions = ({
  selectedOptions,
  handleOptionChange,
  exportOptions,
}: ExportOptionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">محتويات التصدير</h3>
      <div className="grid gap-4">
        {exportOptions.map((option) => (
          <div key={option.id} className="flex items-start space-x-reverse space-x-2">
            <Checkbox
              id={`option-${option.id}`}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={(checked) => handleOptionChange(option.id, !!checked)}
              disabled={option.required}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`option-${option.id}`}
                className={`font-medium ${option.required ? "text-muted-foreground" : ""}`}
              >
                {option.label}
                {option.required && <span className="text-sm text-red-500"> (إلزامي)</span>}
              </label>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
