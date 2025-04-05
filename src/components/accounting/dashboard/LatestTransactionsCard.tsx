
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const LatestTransactionsCard = () => {
  const { entries, isLoading } = useJournalEntries();
  
  // Get only the latest 5 transactions
  const latestTransactions = entries.slice(0, 5);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-500 hover:bg-green-600">معتمد</Badge>;
      case 'draft':
        return <Badge variant="outline">مسودة</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-right">أحدث المعاملات</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">جاري التحميل...</div>
        ) : latestTransactions.length === 0 ? (
          <div className="text-center py-6">لا توجد معاملات حتى الآن</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 font-semibold">التاريخ</th>
                  <th className="py-3 px-2 font-semibold">الرقم المرجعي</th>
                  <th className="py-3 px-2 font-semibold">الوصف</th>
                  <th className="py-3 px-2 font-semibold">المبلغ</th>
                  <th className="py-3 px-2 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {latestTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="py-3 px-2">{formatDate(transaction.date)}</td>
                    <td className="py-3 px-2">{transaction.reference_number || "-"}</td>
                    <td className="py-3 px-2 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-2 font-medium">
                      {formatCurrency(transaction.total_amount || 0)}
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
