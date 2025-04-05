
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLedger } from "@/hooks/accounting/useLedger";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ExportButton } from "@/components/accounting/ExportButton";
import { LedgerTable } from "./LedgerTable";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const GeneralLedger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountType, setAccountType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  
  const { data: ledgerData, isLoading, error } = useLedger(dateRange.from, dateRange.to);
  
  // Filter data based on search term and account type
  const filteredData = ledgerData?.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.account_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = !accountType || entry.account_type === accountType;
    
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-right">دفتر الأستاذ العام</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            from={dateRange.from}
            to={dateRange.to}
            onFromChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
            onToChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
          />
          {ledgerData && <ExportButton data={ledgerData} filename="general_ledger" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="بحث في الحسابات..."
              className="w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={accountType || ""} onValueChange={setAccountType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الحسابات</SelectItem>
                <SelectItem value="asset">الأصول</SelectItem>
                <SelectItem value="liability">الالتزامات</SelectItem>
                <SelectItem value="equity">حقوق الملكية</SelectItem>
                <SelectItem value="revenue">الإيرادات</SelectItem>
                <SelectItem value="expense">المصروفات</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              setSearchTerm("");
              setAccountType(undefined);
            }}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10 text-red-500">
            <p>حدث خطأ أثناء تحميل البيانات</p>
          </div>
        ) : filteredData && filteredData.length > 0 ? (
          <LedgerTable entries={filteredData} />
        ) : (
          <div className="flex justify-center items-center py-10">
            <p>لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
