
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { performanceMonitor } from "@/utils/performanceMonitor";

interface PerformanceHeaderProps {
  refreshData: () => void;
  isMonitoringEnabled: boolean;
  setIsMonitoringEnabled: (enabled: boolean) => void;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  refreshData,
  isMonitoringEnabled,
  setIsMonitoringEnabled,
}) => {
  const { toast } = useToast();

  const toggleMonitoring = () => {
    if (isMonitoringEnabled) {
      performanceMonitor.disable();
      setIsMonitoringEnabled(false);
      toast({
        title: "تم إيقاف مراقبة الأداء",
        description: "تم إيقاف تتبع مقاييس الأداء",
      });
    } else {
      performanceMonitor.enable(true);
      setIsMonitoringEnabled(true);
      toast({
        title: "تم تفعيل مراقبة الأداء",
        description: "سيتم الآن تتبع مقاييس الأداء وعرضها",
      });
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">مقاييس الأداء</h1>
        <p className="text-muted-foreground">مراقبة وتحليل أداء التطبيق</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
        <Button
          variant={isMonitoringEnabled ? "destructive" : "default"}
          size="sm"
          onClick={toggleMonitoring}
        >
          <Activity className="h-4 w-4 ml-2" />
          {isMonitoringEnabled ? "إيقاف المراقبة" : "تفعيل المراقبة"}
        </Button>
      </div>
    </div>
  );
};
