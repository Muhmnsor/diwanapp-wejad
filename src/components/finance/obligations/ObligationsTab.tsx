
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ObligationsTable } from "./ObligationsTable";
import { useObligationsData } from "./hooks/useObligationsData";

export const ObligationsTab = () => {
  const { obligations, loading, totalAmount } = useObligationsData();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الالتزامات المالية</h2>
        <div className="bg-primary/10 text-primary font-semibold p-2 rounded-md">
          إجمالي الالتزامات: {totalAmount.toLocaleString()} ريال
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة الالتزامات</CardTitle>
          <CardDescription className="text-right">جميع الالتزامات المالية على الموارد</CardDescription>
        </CardHeader>
        <CardContent>
          <ObligationsTable obligations={obligations} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};
