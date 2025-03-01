
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetsTable } from "./TargetsTable";
import { FinancialTarget, BudgetItem } from "./TargetsDataService";

interface TargetsContainerProps {
  targets: FinancialTarget[];
  loading: boolean;
  onEdit: (target: FinancialTarget) => void;
  onDelete: (id: string) => void;
  budgetItems: BudgetItem[];
}

export const TargetsContainer: React.FC<TargetsContainerProps> = ({
  targets,
  loading,
  onEdit,
  onDelete,
  budgetItems,
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
            showResourceSource={true}
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
            showBudgetItem={true}
            budgetItems={budgetItems}
          />
        </CardContent>
      </Card>
    </div>
  );
};
