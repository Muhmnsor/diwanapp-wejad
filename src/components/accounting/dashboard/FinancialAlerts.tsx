
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info" | "success";
  date: Date;
}

export const FinancialAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "1",
      title: "اقتراب موعد إغلاق الفترة المحاسبية",
      description: "الفترة المحاسبية الحالية ستنتهي خلال 5 أيام. تأكد من ترحيل جميع القيود المعلقة.",
      type: "warning",
      date: new Date(),
    },
    {
      id: "2",
      title: "تغير في النسب المالية",
      description: "نسبة السيولة انخفضت بمقدار 5% مقارنة بالشهر الماضي.",
      type: "info",
      date: new Date(),
    },
    {
      id: "3",
      title: "زيادة في الإيرادات",
      description: "ارتفعت الإيرادات بنسبة 10% مقارنة بالشهر الماضي.",
      type: "success",
      date: new Date(Date.now() - 86400000),
    },
  ]);

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id}
          className={`
            ${alert.type === "warning" ? "border-amber-500 bg-amber-50" : ""} 
            ${alert.type === "info" ? "border-blue-500 bg-blue-50" : ""} 
            ${alert.type === "success" ? "border-green-500 bg-green-50" : ""}
          `}
        >
          <div className="flex justify-between">
            <div className="flex items-center">
              {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />}
              {alert.type === "info" && <Info className="h-5 w-5 text-blue-600 mr-2" />}
              {alert.type === "success" && <TrendingUp className="h-5 w-5 text-green-600 mr-2" />}
              
              <div>
                <AlertTitle className="text-right mb-1">{alert.title}</AlertTitle>
                <AlertDescription className="text-right text-sm">
                  {alert.description}
                </AlertDescription>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="h-8 px-2"
              onClick={() => dismissAlert(alert.id)}
            >
              إغلاق
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};
