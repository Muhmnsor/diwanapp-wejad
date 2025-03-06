
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { ResourceObligation } from "./types";

interface ObligationsSectionProps {
  obligations: ResourceObligation[];
  onAddObligation: () => void;
  onRemoveObligation: (index: number) => void;
  onObligationChange: (index: number, field: keyof ResourceObligation, value: any) => void;
  totalObligations: number;
}

export const ObligationsSection = ({
  obligations,
  onAddObligation,
  onRemoveObligation,
  onObligationChange,
  totalObligations
}: ObligationsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="obligations" className="text-right block text-sm font-medium">الالتزامات</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onAddObligation}
          className="flex items-center gap-1"
        >
          إضافة التزام
        </Button>
      </div>

      {obligations.length > 0 ? (
        <div className="space-y-4">
          {obligations.map((obligation, index) => (
            <div key={index} className="flex gap-4 items-start bg-muted/30 p-3 rounded-md">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`obligation-amount-${index}`} className="text-right block text-sm">
                  المبلغ (ريال)
                </Label>
                <Input
                  id={`obligation-amount-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={obligation.amount || ""}
                  onChange={(e) => onObligationChange(index, 'amount', Number(e.target.value))}
                  className="text-right"
                />
              </div>
              <div className="flex-[2] space-y-2">
                <Label htmlFor={`obligation-description-${index}`} className="text-right block text-sm">
                  التوضيح
                </Label>
                <Input
                  id={`obligation-description-${index}`}
                  value={obligation.description || ""}
                  onChange={(e) => onObligationChange(index, 'description', e.target.value)}
                  className="text-right"
                  placeholder="توضيح الالتزام"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-7 text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => onRemoveObligation(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="text-left font-medium mt-2 p-2 bg-muted rounded">
            إجمالي الالتزامات: {totalObligations.toLocaleString()} ريال
          </div>
        </div>
      ) : (
        <div className="text-center p-4 text-muted-foreground border rounded-md border-dashed">
          لا توجد التزامات مضافة
        </div>
      )}
    </div>
  );
};
