
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
import { getChartConfig, getTooltipFormatter, getLegendFormatter } from "../utils/chartConfig";
import { ChartLoadingState } from "./ChartLoadingState";
import { ChartEmptyState } from "./ChartEmptyState";

interface ComparisonChartProps {
  data: {
    name: string;
    target: number;
    actual: number;
    variance: number;
  }[];
  loading: boolean;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  loading 
}) => {
  if (loading) {
    return <ChartLoadingState />;
  }

  if (!data || data.length === 0) {
    return <ChartEmptyState />;
  }

  const maxValue = Math.max(
    ...data.map(item => Math.max(item.target, item.actual, Math.abs(item.variance)))
  );

  const config = getChartConfig(maxValue);

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
              margin={config.margin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis {...config.yAxisConfig} />
              <Tooltip formatter={getTooltipFormatter} />
              <Legend formatter={getLegendFormatter} />
              <ReferenceLine y={0} stroke="#000" />
              <Bar 
                dataKey="target" 
                fill="#8884d8" 
                name="target" 
                {...config.barConfig} 
              />
              <Bar 
                dataKey="actual" 
                fill="#82ca9d" 
                name="actual" 
                {...config.barConfig} 
              />
              <Line 
                dataKey="variance" 
                stroke="#ff7300" 
                name="variance" 
                {...config.lineConfig}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

