
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash } from "lucide-react";

export const TargetsTab = () => {
  // يمكن إضافة حالة لإدارة المستهدفات المالية لاحقًا
  const [showAddForm, setShowAddForm] = useState(false);

  // بيانات تجريبية للعرض
  const demoTargets = [
    { id: 1, year: 2023, quarter: 1, type: "موارد", targetAmount: 250000, actualAmount: 230000 },
    { id: 2, year: 2023, quarter: 2, type: "موارد", targetAmount: 300000, actualAmount: 320000 },
    { id: 3, year: 2023, quarter: 3, type: "موارد", targetAmount: 350000, actualAmount: 290000 },
    { id: 4, year: 2023, quarter: 4, type: "موارد", targetAmount: 400000, actualAmount: 0 },
    { id: 5, year: 2023, quarter: 1, type: "مصروفات", targetAmount: 200000, actualAmount: 190000 },
    { id: 6, year: 2023, quarter: 2, type: "مصروفات", targetAmount: 220000, actualAmount: 210000 },
  ];

  const getAchievementPercentage = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المستهدفات المالية</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>إضافة مستهدف جديد</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مستهدفات العام 2023</CardTitle>
          <CardDescription>
            عرض المستهدفات المالية وإمكانية مقارنتها بالأرقام المتحققة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">السنة</TableHead>
                <TableHead className="text-right">الربع</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المستهدف</TableHead>
                <TableHead className="text-right">المتحقق</TableHead>
                <TableHead className="text-right">نسبة التحقيق</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>{target.year}</TableCell>
                  <TableCell>{target.quarter}</TableCell>
                  <TableCell>{target.type}</TableCell>
                  <TableCell>{target.targetAmount.toLocaleString()} ريال</TableCell>
                  <TableCell>{target.actualAmount.toLocaleString()} ريال</TableCell>
                  <TableCell className={getAchievementColor(getAchievementPercentage(target.targetAmount, target.actualAmount))}>
                    {getAchievementPercentage(target.targetAmount, target.actualAmount)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* يمكن إضافة مكون نموذج إضافة مستهدف جديد هنا */}
    </div>
  );
};
