import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditEventHeaderProps {
  isProjectEvent?: boolean;
}

export const EditEventHeader = ({ isProjectEvent }: EditEventHeaderProps) => {
  return (
    <DialogHeader className="text-right">
      <DialogTitle className="text-right">
        {isProjectEvent ? 'تعديل فعالية المشروع' : 'تعديل الفعالية'}
      </DialogTitle>
    </DialogHeader>
  );
};