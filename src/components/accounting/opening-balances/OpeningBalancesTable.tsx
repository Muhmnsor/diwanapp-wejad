
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

// Assuming we have an OpeningBalance interface
interface OpeningBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit_amount: number;
  credit_amount: number;
}

interface OpeningBalancesTableProps {
  entries: OpeningBalance[];
  onEditEntry?: (entry: OpeningBalance) => void;
  readOnly?: boolean;
}

export const OpeningBalancesTable = ({ entries, onEditEntry, readOnly = false }: OpeningBalancesTableProps) => {
  // Group by account type for better visual organization
  const groupedEntries = entries.reduce((acc, entry) => {
    const type = entry.account_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(entry);
    return acc;
  }, {} as Record<string, OpeningBalance[]>);

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

  // Calculate totals
  const totalDebit = entries.reduce((total, entry) => total + entry.debit_amount, 0);
  const totalCredit = entries.reduce((total, entry) => total + entry.credit_amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  return (
    <div className="rounded-md border overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رمز الحساب</TableHead>
            <TableHead className="text-right">اسم الحساب</TableHead>
            <TableHead className="text-right">مدين</TableHead>
            <TableHead className="text-right">دائن</TableHead>
            {!readOnly && <TableHead className="text-right">الإجراءات</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccountTypes.filter(type => groupedEntries[type]).map(type => (
            <React.Fragment key={type}>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={readOnly ? 4 : 5} className="font-bold">
                  {accountTypeLabels[type]}
                </TableCell>
              </TableRow>
              {groupedEntries[type].map((entry) => (
                <TableRow 
                  key={entry.account_id} 
                  className={!readOnly ? "cursor-pointer hover:bg-muted/30" : ""}
                  onClick={!readOnly ? () => onEditEntry && onEditEntry(entry) : undefined}
                >
                  <TableCell>{entry.account_code}</TableCell>
                  <TableCell>{entry.account_name}</TableCell>
                  <TableCell>
                    {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : ""}
                  </TableCell>
                  <TableCell>
                    {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : ""}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {/* Actions here if needed */}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          <TableRow className={`font-bold ${isBalanced ? "bg-green-50" : "bg-red-50"}`}>
            <TableCell colSpan={2} className="text-left">الإجماليات</TableCell>
            <TableCell>{formatCurrency(totalDebit)}</TableCell>
            <TableCell>{formatCurrency(totalCredit)}</TableCell>
            {!readOnly && <TableCell></TableCell>}
          </TableRow>
          <TableRow className={isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
            <TableCell colSpan={readOnly ? 4 : 5} className="text-center">
              {isBalanced ? "أرصدة متوازنة" : "أرصدة غير متوازنة"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
