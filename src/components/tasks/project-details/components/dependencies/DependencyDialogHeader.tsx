
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link2 } from "lucide-react";

export const DependencyDialogHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Link2 className="h-5 w-5" />
        اعتماديات المهمة
      </DialogTitle>
      <DialogDescription>
        إدارة الاعتماديات بين المهام
      </DialogDescription>
    </DialogHeader>
  );
};
