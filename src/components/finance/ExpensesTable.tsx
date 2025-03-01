
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

// بيانات تجريبية للمصروفات
const expenses = [
  {
    id: 1,
    date: "2023-06-05",
    budgetItem: "الرواتب",
    amount: 120000,
    description: "رواتب فريق العمل - شهر يونيو",
    beneficiary: "فريق العمل",
  },
  {
    id: 2,
    date: "2023-06-10",
    budgetItem: "التشغيل",
    amount: 35000,
    description: "إيجار المقر - الربع الثاني",
    beneficiary: "مالك العقار",
  },
  {
    id: 3,
    date: "2023-06-15",
    budgetItem: "تنفيذ البرامج",
    amount: 45000,
    description: "مصاريف برنامج القيادات الشابة",
    beneficiary: "مركز التدريب",
  },
  {
    id: 4,
    date: "2023-06-20",
    budgetItem: "التسويق",
    amount: 18000,
    description: "حملة تسويقية لبرنامج الصيف",
    beneficiary: "وكالة الإعلان",
  },
];

export const ExpensesTable = () => {
  return (
    <div className="relative w-full overflow-auto">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>البند</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الوصف</TableHead>
            <TableHead>المستفيد</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {new Date(expense.date).toLocaleDateString("ar-SA")}
              </TableCell>
              <TableCell>{expense.budgetItem}</TableCell>
              <TableCell>{expense.amount.toLocaleString()} ريال</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.beneficiary}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
