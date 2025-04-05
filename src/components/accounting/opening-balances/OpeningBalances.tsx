
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountingPeriods } from "@/hooks/accounting/useAccountingPeriods";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { OpeningBalanceForm } from "./OpeningBalanceForm";
import { OpeningBalancesTable } from "./OpeningBalancesTable";
import { useOpeningBalances } from "@/hooks/accounting/useOpeningBalances";

export const OpeningBalances = () => {
  const { periods, currentPeriod } = useAccountingPeriods();
  const { accounts } = useAccounts();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(
    currentPeriod?.id
  );
  
  const { openingBalances, isLoading } = useOpeningBalances(selectedPeriodId);

  // Transform the opening balances data for the table
  const prepareOpeningBalancesEntries = () => {
    if (!openingBalances || !accounts) return [];

    return openingBalances.map(balance => {
      const account = balance.account || { id: '', code: '', name: '', account_type: '' };
      
      return {
        account_id: balance.account_id,
        account_code: account.code,
        account_name: account.name,
        account_type: account.account_type,
        debit_amount: Number(balance.debit_amount) || 0,
        credit_amount: Number(balance.credit_amount) || 0
      };
    });
  };
  
  const balanceEntries = prepareOpeningBalancesEntries();
  
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
              <OpeningBalancesTable entries={balanceEntries} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
