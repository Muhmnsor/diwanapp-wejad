
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ar } from 'date-fns/locale';

export const IncomeStatement = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-right">قائمة الدخل</CardTitle>
          <CardDescription className="text-right">
            تحليل الإيرادات والمصروفات للفترة المحددة
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
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: ar })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: ar })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: ar })
                  )
                ) : (
                  <span>اختر فترة زمنية</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ar}
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
                <TableHead className="font-bold text-right">البند</TableHead>
                <TableHead className="text-left">المبلغ</TableHead>
                <TableHead className="text-left">النسبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-right font-bold">الإيرادات</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">إيرادات التشغيل</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">إيرادات التبرعات</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">إيرادات أخرى</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي الإيرادات</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
                <TableCell className="text-left font-bold">100%</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="text-right font-bold">المصروفات</TableCell>
                <TableCell className="text-left"></TableCell>
                <TableCell className="text-left"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">المصروفات الإدارية</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">مصروفات البرامج</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-right pr-6">مصروفات التشغيل</TableCell>
                <TableCell className="text-left">0.00 ريال</TableCell>
                <TableCell className="text-left">0%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">إجمالي المصروفات</TableCell>
                <TableCell className="text-left font-bold">0.00 ريال</TableCell>
                <TableCell className="text-left font-bold">0%</TableCell>
              </TableRow>
              
              <TableRow className="bg-primary/10">
                <TableCell className="text-right font-bold text-lg">صافي الدخل</TableCell>
                <TableCell className="text-left font-bold text-lg">0.00 ريال</TableCell>
                <TableCell className="text-left font-bold text-lg">0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
