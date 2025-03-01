
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

// بيانات تجريبية للبنود وأرصدتها
const budgetItems = [
  {
    id: 1,
    name: "الرواتب",
    percentage: 15.5,
    allocated: 350000,
    spent: 240000,
    remaining: 110000,
  },
  {
    id: 2,
    name: "التشغيل",
    percentage: 11.3,
    allocated: 260000,
    spent: 180000,
    remaining: 80000,
  },
  {
    id: 3,
    name: "العقود",
    percentage: 25.9,
    allocated: 610000,
    spent: 420000,
    remaining: 190000,
  },
  {
    id: 4,
    name: "التسويق",
    percentage: 8.4,
    allocated: 200000,
    spent: 150000,
    remaining: 50000,
  },
  {
    id: 5,
    name: "تنفيذ البرامج",
    percentage: 39,
    allocated: 930000,
    spent: 490000,
    remaining: 440000,
  },
];

export const BudgetItemsTable = () => {
  return (
    <div className="relative w-full overflow-auto">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>البند</TableHead>
            <TableHead>النسبة</TableHead>
            <TableHead>المخصص</TableHead>
            <TableHead>المصروف</TableHead>
            <TableHead>المتبقي</TableHead>
            <TableHead>نسبة الاستهلاك</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetItems.map((item) => {
            // حساب نسبة الاستهلاك
            const spentPercentage = Math.round((item.spent / item.allocated) * 100);
            
            // تحديد لون نسبة الاستهلاك بناءً على قيمتها
            let progressColor = "bg-green-500";
            if (spentPercentage > 75) progressColor = "bg-red-500";
            else if (spentPercentage > 50) progressColor = "bg-yellow-500";
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>{item.allocated.toLocaleString()} ريال</TableCell>
                <TableCell>{item.spent.toLocaleString()} ريال</TableCell>
                <TableCell>{item.remaining.toLocaleString()} ريال</TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Progress value={spentPercentage} className={progressColor} />
                    <span className="text-xs">{spentPercentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
