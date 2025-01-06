import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <div className="space-y-2">
        <Label>اتجاه الصفحة</Label>
        <Select
          value={orientation}
          onValueChange={(value) => onChange('orientation', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر اتجاه الصفحة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">عمودي</SelectItem>
            <SelectItem value="landscape">أفقي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>حجم الصفحة</Label>
        <Select
          value={pageSize}
          onValueChange={(value) => onChange('page_size', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر حجم الصفحة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="A5">A5</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};