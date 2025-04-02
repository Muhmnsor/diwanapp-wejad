
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface HRStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: number[];
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}

export function HRStatsCard({
  title,
  value,
  change,
  trend = [],
  icon,
  description,
  loading = false
}: HRStatsCardProps) {
  // Determine trend direction
  const isPositive = typeof change === 'number' ? change >= 0 : null;
  
  // Only show trend if we have enough data
  const showSparkline = trend && trend.length > 1;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 w-20 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            
            {typeof change === 'number' && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <span className={cn(
                  "flex items-center",
                  isPositive && "text-green-500",
                  isPositive === false && "text-red-500"
                )}>
                  {isPositive === true && <TrendingUp className="mr-1 h-3 w-3" />}
                  {isPositive === false && <TrendingDown className="mr-1 h-3 w-3" />}
                  {isPositive === null && <Minus className="mr-1 h-3 w-3" />}
                  {change > 0 && "+"}
                  {change}%
                </span>
                <span>compared to previous period</span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            
            {showSparkline && (
              <div className="mt-3">
                <Sparkline 
                  data={trend} 
                  height={20}
                  color={isPositive !== false ? "#4ade80" : "#f87171"}
                >
                  {trend.length > 0 && <SparklineSpot 
                    spotColors={{
                      endSpot: isPositive !== false ? "#4ade80" : "#f87171",
                      spotColor: isPositive !== false ? "rgba(74, 222, 128, 0.6)" : "rgba(248, 113, 113, 0.6)"
                    }} 
                  />}
                </Sparkline>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
