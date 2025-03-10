
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialSummaryCardProps {
  financialData: {
    totalResources: number;
    totalExpenses: number;
    totalObligations?: number;
    totalCashFlow?: number;
    resourcesTarget: number;
    resourcesPercentage: number;
    resourcesRemaining: number;
    currentYear: number;
  };
  loading: boolean;
  formatCurrency: (num: number) => string;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  financialData,
  loading,
  formatCurrency,
}) => {
  if (loading) {
    return <div className="text-center py-4">جاري تحميل البيانات...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>الملخص المالي - {financialData.currentYear}</CardTitle>
        <CardDescription>نظرة عامة على الوضع المالي للسنة الحالية</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">ملخص الموارد والمصروفات</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي الموارد:</span>
                <span className="font-medium">{formatCurrency(financialData.totalResources)}</span>
              </div>
              {financialData.totalCashFlow !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي التدفقات:</span>
                  <span className="font-medium">{formatCurrency(financialData.totalCashFlow)}</span>
                </div>
              )}
              {financialData.totalObligations !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي الالتزامات:</span>
                  <span className="font-medium">{formatCurrency(financialData.totalObligations)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي المصروفات:</span>
                <span className="font-medium">{formatCurrency(financialData.totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد الحالي:</span>
                <span className={`font-medium ${financialData.totalResources - financialData.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialData.totalResources - financialData.totalExpenses)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">تحقيق المستهدفات</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مستهدف الموارد:</span>
                <span className="font-medium">{formatCurrency(financialData.resourcesTarget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">نسبة التحقق:</span>
                <span className={`font-medium ${
                  financialData.resourcesPercentage >= 90 ? 'text-green-600' : 
                  financialData.resourcesPercentage >= 70 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>{financialData.resourcesPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المتبقي للتحقيق:</span>
                <span className="font-medium">{formatCurrency(financialData.resourcesRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
