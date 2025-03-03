
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddStageFormProps {
  newStageName: string;
  setNewStageName: (name: string) => void;
  addStage: () => Promise<void>;
  cancelAdding: () => void;
}

export const AddStageForm = ({ 
  newStageName, 
  setNewStageName,
  addStage, 
  cancelAdding 
}: AddStageFormProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        value={newStageName}
        onChange={(e) => setNewStageName(e.target.value)}
        placeholder="اسم المرحلة الجديدة"
        className="flex-grow"
      />
      <Button onClick={addStage}>إضافة</Button>
      <Button variant="outline" onClick={cancelAdding}>إلغاء</Button>
    </div>
  );
};
