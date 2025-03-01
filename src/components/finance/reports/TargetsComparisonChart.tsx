
import { ComparisonChart } from "./components/ComparisonChart";

interface TargetsComparisonChartProps {
  data: {
    name: string;
    target: number;
    actual: number;
    variance: number;
  }[];
  loading: boolean;
}

export const TargetsComparisonChart: React.FC<TargetsComparisonChartProps> = ({ 
  data, 
  loading 
}) => {
  return <ComparisonChart data={data} loading={loading} />;
};

