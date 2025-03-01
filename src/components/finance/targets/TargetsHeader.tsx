
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type TargetsHeaderProps = {
  onAddNew: () => void;
};

export const TargetsHeader = ({ onAddNew }: TargetsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">المستهدفات المالية</h2>
      <Button 
        onClick={onAddNew} 
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        <span>إضافة مستهدف جديد</span>
      </Button>
    </div>
  );
};
