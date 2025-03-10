
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge } from "lucide-react";
import { toast } from "sonner";

export const PerformanceTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قياس الأداء</CardTitle>
        <CardDescription>مراقبة وقياس أداء التطبيق</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">وقت تحميل الصفحة</h3>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">300ms</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">استخدام الذاكرة</h3>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">24MB</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">استجابة API</h3>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">120ms</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
          
          <Button className="w-full mt-2" onClick={() => toast.success("جاري قياس الأداء...")}>
            <Gauge className="h-4 w-4 ml-2" />
            قياس الأداء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
