
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { EditTaskProjectFields } from "./form/EditTaskProjectFields";
import { EditTaskProjectActions } from "./form/EditTaskProjectActions";
import { useEditTaskProject, TaskProject } from "./hooks/useEditTaskProject";

interface EditTaskProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: TaskProject;
  onSuccess?: () => void;
}

export const EditTaskProjectDialog = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditTaskProjectDialogProps) => {
  const { form, isSubmitting, handleSubmit, managers } = useEditTaskProject({
    project,
    onSuccess,
    onClose,
    isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المشروع</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل المشروع أدناه
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <EditTaskProjectFields form={form} managers={managers} />
            <EditTaskProjectActions 
              isSubmitting={isSubmitting} 
              onClose={onClose} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
