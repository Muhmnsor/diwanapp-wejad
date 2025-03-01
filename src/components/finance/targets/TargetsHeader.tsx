
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface TargetsHeaderProps {
  onOpenAddForm: () => void;
}

export const TargetsHeader: React.FC<TargetsHeaderProps> = ({ onOpenAddForm }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-primary">المستهدفات المالية</h2>
      <Button
        onClick={onOpenAddForm}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>إضافة مستهدف</span>
      </Button>
    </div>
  );
};
