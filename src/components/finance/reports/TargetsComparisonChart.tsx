
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface TargetsComparisonChartProps {
  data: {
    name: string;
    target: number;
    actual: number;
    variance: number;
  }[];
  loading: boolean;
}

export const TargetsComparisonChart: React.FC<TargetsComparisonChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مقارنة المستهدفات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مقارنة المستهدفات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
        </CardContent>
      </Card>
    );
  }

  // تنسيق الأرقام كعملة سعودية
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(value));
  };

  // حساب أقصى قيمة في البيانات لتعيين نطاق المحور Y
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.target, item.actual, Math.abs(item.variance)))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>مقارنة المستهدفات والمصروفات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                domain={[0, maxValue + (maxValue * 0.1)]} 
                tickFormatter={(value) => formatCurrency(value)} 
                width={100}
              />
              <Tooltip 
                formatter={(value, name) => {
                  // تخصيص عرض القيم في التلميح
                  let label;
                  switch(name) {
                    case "target":
                      label = "المستهدف";
                      break;
                    case "actual":
                      label = "المتحقق";
                      break;
                    case "variance":
                      label = "الانحراف";
                      break;
                    default:
                      label = name;
                  }
                  return [formatCurrency(Number(value)), label];
                }}
              />
              <Legend 
                formatter={(value) => {
                  // تخصيص عرض الأسماء في وسيلة الإيضاح
                  switch(value) {
                    case "target":
                      return "المستهدف";
                    case "actual":
                      return "المتحقق";
                    case "variance":
                      return "الانحراف";
                    default:
                      return value;
                  }
                }}
              />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="target" fill="#8884d8" name="target" barSize={30} />
              <Bar dataKey="actual" fill="#82ca9d" name="actual" barSize={30} />
              <Line 
                type="monotone" 
                dataKey="variance" 
                stroke="#ff7300" 
                name="variance" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
