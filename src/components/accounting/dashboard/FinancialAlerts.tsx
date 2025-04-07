// src/components/accounting/dashboard/FinancialAlerts.tsx
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancialAlerts } from "@/hooks/accounting/useFinancialAlerts";

export const FinancialAlerts = () => {
  const { alerts: fetchedAlerts, loading } = useFinancialAlerts();
  // استخدام الـ useState للاحتفاظ بالإشعارات التي لم يتم إغلاقها
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // تصفية الإشعارات المغلقة
  const visibleAlerts = fetchedAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
  
  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  if (loading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-gray-500">جاري تحميل البيانات المالية...</p>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => (
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
