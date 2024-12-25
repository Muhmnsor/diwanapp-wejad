import { Button } from "@/components/ui/button";

interface AddReportButtonProps {
  onClick: () => void;
}

export const AddReportButton = ({ onClick }: AddReportButtonProps) => {
  return (
    <div className="flex justify-end">
      <Button onClick={onClick}>
        إضافة تقرير الفعالية
      </Button>
    </div>
  );
};