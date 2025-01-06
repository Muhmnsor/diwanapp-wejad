import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PageSettingsStepProps {
  orientation: string;
  pageSize: string;
  onChange: (field: string, value: string) => void;
}

export const PageSettingsStep = ({
  orientation,
  pageSize,
  onChange
}: PageSettingsStepProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orientation">اتجاه الصفحة</Label>
          <select
            id="orientation"
            value={orientation}
            onChange={(e) => onChange('orientation', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="portrait">عمودي</option>
            <option value="landscape">أفقي</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="page_size">حجم الصفحة</Label>
          <select
            id="page_size"
            value={pageSize}
            onChange={(e) => onChange('page_size', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>
      </div>
    </Card>
  );
};