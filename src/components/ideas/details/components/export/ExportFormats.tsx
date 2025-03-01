
import { Checkbox } from "@/components/ui/checkbox";
import { ExportFormatsProps } from "./types";

export const ExportFormats = ({
  selectedFormat,
  handleFormatChange,
  exportFormats,
}: ExportFormatsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">تنسيق التصدير</h3>
      <div className="grid gap-4">
        {exportFormats.map((format) => (
          <div key={format.id} className="flex items-start space-x-reverse space-x-2">
            <Checkbox
              id={`format-${format.id}`}
              checked={selectedFormat === format.id}
              onCheckedChange={(checked) => handleFormatChange(format.id, !!checked)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor={`format-${format.id}`} className="font-medium">
                {format.label}
              </label>
              <p className="text-sm text-muted-foreground">{format.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
