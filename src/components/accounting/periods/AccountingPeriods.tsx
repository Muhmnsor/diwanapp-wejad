
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useAccountingPeriods } from "@/hooks/accounting/useAccountingPeriods";
import { AccountingPeriodForm } from "./AccountingPeriodForm";
import { AccountingPeriodsTable } from "./AccountingPeriodsTable";

export const AccountingPeriods = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  
  const { periods, currentPeriod, isLoading, error } = useAccountingPeriods();
  
  const handleAddPeriod = () => {
    setSelectedPeriod(null);
    setShowForm(true);
  };

  const handleEditPeriod = (period: any) => {
    setSelectedPeriod(period);
    setShowForm(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">الفترات المحاسبية</h2>
          {currentPeriod && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              <Calendar className="h-3 w-3 mr-1" />
              الفترة الحالية: {currentPeriod.name}
            </span>
          )}
        </div>
        <Button onClick={handleAddPeriod} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة فترة جديدة
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedPeriod ? "تعديل فترة محاسبية" : "إضافة فترة محاسبية جديدة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AccountingPeriodForm 
              period={selectedPeriod}
              onCancel={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة الفترات المحاسبية</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountingPeriodsTable 
            periods={periods} 
            isLoading={isLoading}
            onEdit={handleEditPeriod}
          />
        </CardContent>
      </Card>
    </>
  );
};
