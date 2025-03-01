
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetsComparisonChart } from "./TargetsComparisonChart";

interface ComparisonReportCardProps {
  comparisonData: any[];
  loading: boolean;
}

export const ComparisonReportCard: React.FC<ComparisonReportCardProps> = ({ 
  comparisonData, 
  loading 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقرير المقارنة السنوية</CardTitle>
        <CardDescription>مقارنة بين السنوات المالية المختلفة</CardDescription>
      </CardHeader>
      <CardContent>
        <TargetsComparisonChart data={comparisonData} loading={loading} />
      </CardContent>
    </Card>
  );
};
