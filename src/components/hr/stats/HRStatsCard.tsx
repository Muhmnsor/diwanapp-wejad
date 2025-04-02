
import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface HRStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function HRStatsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-blue-100",
  iconTextColor = "text-blue-600",
  trend,
  trendLabel,
  sparklineData = [],
  sparklineColor,
  className,
  children,
}: HRStatsCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const trendColor = trend === undefined ? "text-muted-foreground" : 
                    isPositiveTrend ? "text-green-600" : "text-red-600";
  
  const trendBgColor = trend === undefined ? "bg-gray-50" : 
                      isPositiveTrend ? "bg-green-50" : "bg-red-50";
  
  // Set sparkline color based on trend
  const finalSparklineColor = sparklineColor || 
                            (isPositiveTrend ? "#4ade80" : "#f87171");

  return (
    <Card className={cn("p-4 flex flex-col space-y-4", className)}>
      <div className="flex items-center space-x-4 space-x-reverse rtl:text-right">
        <div className={cn("p-2 rounded-full", iconBgColor)}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: cn("h-6 w-6", iconTextColor) 
          })}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
      
      {sparklineData.length > 0 && (
        <div className="h-8 mt-2">
          <Sparkline 
            data={sparklineData} 
            height={24} 
            color={finalSparklineColor}
          >
            <SparklineSpot 
              spotColors={{
                endSpot: finalSparklineColor,
                spotColor: `${finalSparklineColor}99`
              }}
            />
          </Sparkline>
        </div>
      )}

      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center mt-1">
          {trend !== undefined && (
            <div className={cn("flex items-center rounded-full px-2 py-0.5 text-xs", trendBgColor)}>
              {isPositiveTrend ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              <span className={trendColor}>{Math.abs(trend)}%</span>
            </div>
          )}
          {trendLabel && (
            <span className="text-xs text-muted-foreground ml-2">
              {trendLabel}
            </span>
          )}
        </div>
      )}
      
      {children}
    </Card>
  );
}
