
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowDownCircle, ArrowUpCircle, BarChart4 } from "lucide-react";

export const AccountingDashboard = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.00 ريال</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.00 ريال</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.00 ريال</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
          <BarChart4 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.00 ريال</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-right">نظرة عامة على المحاسبة</CardTitle>
          <CardDescription className="text-right">
            لوحة معلومات النظام المحاسبي ستكون متاحة بعد إنشاء البيانات الأساسية.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            قم بإنشاء دليل الحسابات وتسجيل القيود المحاسبية لعرض التحليلات والرسوم البيانية هنا.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
