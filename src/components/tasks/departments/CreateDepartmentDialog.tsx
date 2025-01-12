import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DepartmentForm } from "./DepartmentForm";
import { useState } from "react";

interface CreateDepartmentDialogProps {
  onDepartmentCreated: () => void;
}

export const CreateDepartmentDialog = ({ onDepartmentCreated }: CreateDepartmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة إدارة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة إدارة جديدة</DialogTitle>
        </DialogHeader>
        <DepartmentForm 
          onSuccess={onDepartmentCreated}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};