
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";

interface LedgerTableProps {
  entries: {
    account_id: string;
    account_code: string;
    account_name: string;
    debit_total: number;
    credit_total: number;
    balance: number;
    account_type: string;
  }[];
}

export const LedgerTable = ({ entries }: LedgerTableProps) => {
  // Group by account type for better visual organization
  const groupedEntries = entries.reduce((acc, entry) => {
    const type = entry.account_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

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
  const totalDebits = entries.reduce((total, entry) => total + entry.debit_total, 0);
  const totalCredits = entries.reduce((total, entry) => total + entry.credit_total, 0);
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رمز الحساب</TableHead>
            <TableHead className="text-right">اسم الحساب</TableHead>
            <TableHead className="text-right">مدين</TableHead>
            <TableHead className="text-right">دائن</TableHead>
            <TableHead className="text-right">الرصيد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccountTypes.filter(type => groupedEntries[type]).map(type => (
            <React.Fragment key={type}>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="font-bold">
                  {accountTypeLabels[type]}
                </TableCell>
              </TableRow>
              {groupedEntries[type].map((entry) => (
                <TableRow key={entry.account_id}>
                  <TableCell>{entry.account_code}</TableCell>
                  <TableCell>{entry.account_name}</TableCell>
                  <TableCell>{formatCurrency(entry.debit_total)}</TableCell>
                  <TableCell>{formatCurrency(entry.credit_total)}</TableCell>
                  <TableCell className={entry.balance < 0 ? "text-red-500" : ""}>
                    {formatCurrency(Math.abs(entry.balance))}
                    {entry.balance < 0 ? " (دائن)" : entry.balance > 0 ? " (مدين)" : ""}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={2}>الإجماليات</TableCell>
            <TableCell>{formatCurrency(totalDebits)}</TableCell>
            <TableCell>{formatCurrency(totalCredits)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
