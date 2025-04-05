
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDown, CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const BalanceSheet = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-right">الميزانية العمومية</CardTitle>
          <CardDescription className="text-right">
            عرض الميزانية العمومية كما في تاريخ محدد
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <FileDown className="h-4 w-4" />
            تصدير التقرير
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>اختر تاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-lg text-right" colSpan={2}>
                  الأصول
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-right font-bold">الأصول المتداولة</TableCell>
                <TableCell className="text-left"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">النقد وما يعادله</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">الذمم المدينة</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">المخزون</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي الأصول المتداولة</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="text-right font-bold">الأصول الثابتة</TableCell>
                <TableCell className="text-left"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">المباني والعقارات</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">المعدات والأجهزة</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">الأثاث والتجهيزات</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي الأصول الثابتة</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
              </TableRow>
              
              <TableRow className="bg-primary/10">
                <TableCell className="text-right font-bold text-lg">إجمالي الأصول</TableCell>
                <TableCell className="text-left font-bold text-lg">0.00 ريال</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="rounded-md border mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-lg text-right" colSpan={2}>
                  الالتزامات وحقوق الملكية
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-right font-bold">الالتزامات المتداولة</TableCell>
                <TableCell className="text-left"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">الذمم الدائنة</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">المصروفات المستحقة</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي الالتزامات المتداولة</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="text-right font-bold">حقوق الملكية</TableCell>
                <TableCell className="text-left"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">رأس المال</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">الأرباح المحتجزة</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي حقوق الملكية</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
              </TableRow>
              
              <TableRow className="bg-primary/10">
                <TableCell className="text-right font-bold text-lg">إجمالي الالتزامات وحقوق الملكية</TableCell>
                <TableCell className="text-left font-bold text-lg">0.00 ريال</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
