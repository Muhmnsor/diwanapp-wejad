
import { RequestTypesList } from "../RequestTypesList";

interface FormsTabProps {
  onSelectType: (requestType: any) => void;
}

export const FormsTab = ({ onSelectType }: FormsTabProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">تقديم طلب جديد</h2>
      <p className="mb-6 text-muted-foreground">
        اختر نوع الطلب الذي ترغب في تقديمه من القائمة أدناه
      </p>
      <RequestTypesList onSelectType={onSelectType} />
    </div>
  );
};
