
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetsTable } from "./TargetsTable";
import { FinancialTarget } from "./TargetsDataService";

type TargetsContainerProps = {
  targets: FinancialTarget[];
  loading: boolean;
  onEdit: (target: FinancialTarget) => void;
  onDelete: (id: string) => void;
};

export const TargetsContainer = ({ targets, loading, onEdit, onDelete }: TargetsContainerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>المستهدفات المالية</CardTitle>
        <CardDescription>
          عرض المستهدفات المالية وإمكانية مقارنتها بالأرقام المتحققة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TargetsTable 
          targets={targets} 
          loading={loading} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </CardContent>
    </Card>
  );
};
