
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
import { Badge } from "@/components/ui/badge";

// بيانات تجريبية للموارد
const resources = [
  {
    id: 1,
    date: "2023-05-10",
    source: "منحة",
    type: "مقيد",
    entity: "مؤسسة الإحسان",
    totalAmount: 500000,
    obligationsAmount: 50000,
    netAmount: 450000,
  },
  {
    id: 2,
    date: "2023-06-15",
    source: "تبرع",
    type: "غير مقيد",
    entity: "فاعل خير",
    totalAmount: 300000,
    obligationsAmount: 0,
    netAmount: 300000,
  },
  {
    id: 3,
    date: "2023-07-20",
    source: "إيرادات",
    type: "غير مقيد",
    entity: "برنامج التدريب",
    totalAmount: 200000,
    obligationsAmount: 25000,
    netAmount: 175000,
  },
];

export const ResourcesTable = () => {
  return (
    <div className="relative w-full overflow-auto">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>المصدر</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الجهة</TableHead>
            <TableHead>المبلغ الإجمالي</TableHead>
            <TableHead>الالتزامات</TableHead>
            <TableHead>المبلغ الصافي</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell>
                {new Date(resource.date).toLocaleDateString("ar-SA")}
              </TableCell>
              <TableCell>{resource.source}</TableCell>
              <TableCell>
                <Badge variant={resource.type === "مقيد" ? "outline" : "default"}>
                  {resource.type}
                </Badge>
              </TableCell>
              <TableCell>{resource.entity}</TableCell>
              <TableCell>{resource.totalAmount.toLocaleString()} ريال</TableCell>
              <TableCell>{resource.obligationsAmount.toLocaleString()} ريال</TableCell>
              <TableCell>{resource.netAmount.toLocaleString()} ريال</TableCell>
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
