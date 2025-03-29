
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ReportsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التقارير</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">نوع التقرير</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع التقرير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attendance">تقرير الحضور</SelectItem>
              <SelectItem value="leaves">تقرير الإجازات</SelectItem>
              <SelectItem value="training">تقرير التدريب</SelectItem>
              <SelectItem value="payroll">تقرير الرواتب</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-left md:text-right">
          <Button className="mt-8">إنشاء التقرير</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">تقارير الموارد البشرية</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg mb-2">سيتم هنا عرض وإنشاء تقارير الموارد البشرية</p>
          <p className="text-sm text-muted-foreground">يمكنك إنشاء تقارير متنوعة عن الموظفين والحضور والإجازات والرواتب</p>
        </CardContent>
      </Card>
    </div>
  );
}
