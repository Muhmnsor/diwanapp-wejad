
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gauge, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface PerformanceMetric {
  name: string;
  value: string;
  percentage: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: "وقت تحميل الصفحة", value: "300ms", percentage: 15 },
    { name: "استخدام الذاكرة", value: "24MB", percentage: 30 },
    { name: "استجابة API", value: "120ms", percentage: 12 }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleMeasurePerformance = () => {
    setIsRefreshing(true);
    
    // Simulate performance measurement
    setTimeout(() => {
      const newMetrics: PerformanceMetric[] = [
        { 
          name: "وقت تحميل الصفحة", 
          value: `${Math.floor(Math.random() * 200 + 100)}ms`, 
          percentage: Math.floor(Math.random() * 25)
        },
        { 
          name: "استخدام الذاكرة", 
          value: `${Math.floor(Math.random() * 30 + 10)}MB`, 
          percentage: Math.floor(Math.random() * 40 + 10)
        },
        { 
          name: "استجابة API", 
          value: `${Math.floor(Math.random() * 150 + 50)}ms`, 
          percentage: Math.floor(Math.random() * 20 + 5)
        },
        { 
          name: "وقت التصيير", 
          value: `${Math.floor(Math.random() * 100 + 20)}ms`, 
          percentage: Math.floor(Math.random() * 15 + 5)
        }
      ];
      
      setMetrics(newMetrics);
      setIsRefreshing(false);
      toast.success("تم قياس الأداء بنجاح");
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>قياس الأداء</CardTitle>
        <CardDescription>مراقبة وقياس أداء التطبيق</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{metric.name}</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">{metric.value}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${metric.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          <Button 
            className="w-full mt-2" 
            onClick={handleMeasurePerformance}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                جاري القياس...
              </>
            ) : (
              <>
                <Gauge className="h-4 w-4 ml-2" />
                قياس الأداء
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
