
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { FinancialTarget } from "../TargetsDataService";

interface FormActionsProps {
  editingTarget: FinancialTarget | null;
  onCancel: () => void;
  onUpdate: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  editingTarget, 
  onCancel, 
  onUpdate 
}) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      {editingTarget ? (
        <>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 me-2" />
            إلغاء
          </Button>
          <Button type="button" onClick={onUpdate}>
            <Save className="h-4 w-4 me-2" />
            حفظ التغييرات
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">إضافة المستهدف</Button>
        </>
      )}
    </div>
  );
};
