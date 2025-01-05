import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Move, X } from "lucide-react";

interface FieldsListProps {
  fields: Record<string, string>;
  fieldMappings: Record<string, string>;
  onRemoveField: (key: string) => void;
}

export const FieldsList = ({ fields, fieldMappings, onRemoveField }: FieldsListProps) => {
  console.log('FieldsList render:', { fields, fieldMappings });

  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([key, value], index) => (
        <div key={key} className="group relative flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
          <Move className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <Input value={key} disabled className="flex-1" />
          <Input value={value} disabled className="flex-1" />
          {fieldMappings[key] && (
            <span className="text-sm text-muted-foreground">
              (مربوط: {fieldMappings[key]})
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveField(key)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};