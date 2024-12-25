import { Input } from "@/components/ui/input";

interface SatisfactionLevelProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const SatisfactionLevel = ({ value, onChange }: SatisfactionLevelProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">مستوى الرضا (من 1 إلى 100)</label>
      <Input
        type="number"
        min={1}
        max={100}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder="أدخل مستوى الرضا"
        className="text-right"
      />
    </div>
  );
};