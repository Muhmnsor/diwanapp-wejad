import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";
import { TrialBalanceData } from "@/hooks/accounting/useTrialBalance";

interface TrialBalanceTableProps {
  data: TrialBalanceData;
}

export const TrialBalanceTable = ({ data }: TrialBalanceTableProps) => {
  // Group entries by account type
  const groupedEntries = data.entries.reduce((acc, entry) => {
    const type = entry.account_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(entry);
    return acc;
  }, {} as Record<string, typeof data.entries>);

  // Account type labels in Arabic
  const accountTypeLabels: Record<string, string> = {
    asset: "الأصول",
    liability: "الالتزامات",
    equity: "حقوق الملكية",
    revenue: "الإيرادات",
    expense: "المصروفات"
  };

  // Sort account types in logical order
  const sortedAccountTypes = ["asset", "liability", "equity", "revenue", "expense"];

  return (
    <div className="rounded-md border overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رمز الحساب</TableHead>
            <TableHead className="text-right">اسم الحساب</TableHead>
            <TableHead className="text-right">مدين</TableHead>
            <TableHead className="text-right">دائن</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccountTypes.filter(type => groupedEntries[type]).map(type => (
            <React.Fragment key={type}>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="font-bold">
                  {accountTypeLabels[type]}
                </TableCell>
              </TableRow>
              {groupedEntries[type].map((entry) => (
                <TableRow key={entry.account_id}>
                  <TableCell>{entry.account_code}</TableCell>
                  <TableCell>{entry.account_name}</TableCell>
                  <TableCell>
                    {entry.debit_balance > 0 ? formatCurrency(entry.debit_balance) : ""}
                  </TableCell>
                  <TableCell>
                    {entry.credit_balance > 0 ? formatCurrency(entry.credit_balance) : ""}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          <TableRow className="font-bold bg-muted">
            <TableCell colSpan={2} className="text-left">الإجماليات</TableCell>
            <TableCell>{formatCurrency(data.totalDebit)}</TableCell>
            <TableCell>{formatCurrency(data.totalCredit)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
