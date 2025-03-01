
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetsTable } from "./TargetsTable";
import { FinancialTarget } from "./TargetsDataService";

interface TargetsContainerProps {
  targets: FinancialTarget[];
  loading: boolean;
  onEdit: (target: FinancialTarget) => void;
  onDelete: (id: string) => void;
}

export const TargetsContainer: React.FC<TargetsContainerProps> = ({
  targets,
  loading,
  onEdit,
  onDelete,
}) => {
  // تقسيم المستهدفات إلى موارد ومصروفات
  const resourceTargets = targets.filter(target => target.type === "موارد");
  const expenseTargets = targets.filter(target => target.type === "مصروفات");

  return (
    <div className="space-y-6">
      {/* جدول مستهدفات الموارد */}
      <Card>
        <CardHeader>
          <CardTitle>مستهدفات الموارد</CardTitle>
        </CardHeader>
        <CardContent>
          <TargetsTable
            targets={resourceTargets}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      {/* جدول مستهدفات المصروفات */}
      <Card>
        <CardHeader>
          <CardTitle>مستهدفات المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <TargetsTable
            targets={expenseTargets}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
