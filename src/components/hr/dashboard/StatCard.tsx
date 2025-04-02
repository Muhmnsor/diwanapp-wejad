
import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { getTrendDirection, getTrendPercentage } from "@/hooks/hr/useHRStats";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trendData?: number[];
  trendColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trendData = [],
  trendColor = "#4ade80",
  className
}: StatCardProps) {
  // Check if we have valid trend data (at least 2 points)
  const hasValidTrend = trendData && trendData.length >= 2;
  const trendDirection = hasValidTrend ? getTrendDirection(trendData) : 'neutral';
  const trendPercentage = hasValidTrend ? getTrendPercentage(trendData) : 0;

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="p-2 rounded-full bg-opacity-20" style={{ backgroundColor: `${trendColor}30` }}>
          {icon}
        </div>
        <div className="flex-1 rtl:text-right">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {hasValidTrend && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 space-x-reverse">
              {trendDirection === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
              {trendDirection === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
              {trendDirection === 'neutral' && <Minus className="h-3 w-3 text-gray-500" />}
              <span className={`text-xs ${
                trendDirection === 'up' ? 'text-green-500' : 
                trendDirection === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {trendPercentage}%
              </span>
            </div>
            <div className="h-8 w-24">
              <Sparkline data={trendData} height={20} color={trendColor}>
                <SparklineSpot spotColors={{ 
                  endSpot: trendColor,
                  spotColor: `${trendColor}80`
                }} />
              </Sparkline>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
