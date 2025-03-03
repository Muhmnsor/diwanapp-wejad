
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditStageFormProps {
  editStageName: string;
  setEditStageName: (name: string) => void;
  saveEdit: () => Promise<void>;
  cancelEdit: () => void;
}

export const EditStageForm = ({ 
  editStageName, 
  setEditStageName,
  saveEdit, 
  cancelEdit 
}: EditStageFormProps) => {
  return (
    <div className="flex gap-2">
      <Input
        value={editStageName}
        onChange={(e) => setEditStageName(e.target.value)}
        className="w-32 h-8"
      />
      <Button size="sm" className="h-8 px-2" onClick={saveEdit}>حفظ</Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 px-2"
        onClick={cancelEdit}
      >
        إلغاء
      </Button>
    </div>
  );
};
