
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountingPeriods } from "@/hooks/accounting/useAccountingPeriods";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { OpeningBalanceForm } from "./OpeningBalanceForm";
import { OpeningBalancesTable } from "./OpeningBalancesTable";

export const OpeningBalances = () => {
  const { periods, currentPeriod } = useAccountingPeriods();
  const { accounts } = useAccounts();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(
    currentPeriod?.id
  );
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">الأرصدة الافتتاحية</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">إدارة الأرصدة الافتتاحية</CardTitle>
          </CardHeader>
          <CardContent>
            <OpeningBalanceForm 
              periods={periods}
              accounts={accounts}
              selectedPeriodId={selectedPeriodId}
              onPeriodChange={setSelectedPeriodId}
            />
          </CardContent>
        </Card>

        {selectedPeriodId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">جدول الأرصدة الافتتاحية</CardTitle>
            </CardHeader>
            <CardContent>
              <OpeningBalancesTable periodId={selectedPeriodId} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
