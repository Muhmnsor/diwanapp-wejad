import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { PortfolioProjectForm } from "./components/PortfolioProjectForm";
import { usePortfolioProjectSubmit } from "./hooks/usePortfolioProjectSubmit";
import { CreatePortfolioProjectDialogProps, PortfolioProjectFormData } from "./types/portfolio";

export const CreatePortfolioProjectDialog = ({
  open,
  onOpenChange,
  portfolioId,
  onSuccess
}: CreatePortfolioProjectDialogProps) => {
  const [formData, setFormData] = useState<PortfolioProjectFormData>({
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
    status: "not_started",
    privacy: "private",
  });

  const { handleSubmit, isSubmitting } = usePortfolioProjectSubmit(
    portfolioId,
    onSuccess,
    onOpenChange
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
        </DialogHeader>

        <PortfolioProjectForm
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};