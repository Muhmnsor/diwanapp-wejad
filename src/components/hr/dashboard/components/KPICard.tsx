
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendProps {
  value: number;
  label: string;
  direction?: "up" | "down" | "neutral";
  isPositive?: boolean;
  suffix?: string;
}

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  suffix?: string;
  trend?: TrendProps;
  sparkData: number[];
  sparkColor?: string;
}

export function KPICard({
  title,
  value,
  icon,
  description,
  suffix,
  trend,
  sparkData,
  sparkColor = "#4ade80",
}: KPICardProps) {
  const renderTrendIcon = () => {
    if (!trend?.direction || trend.direction === "neutral") return null;
    
    const iconProps = { 
      size: 16, 
      className: trend.direction === "up" 
        ? (trend.isPositive ? "text-green-500" : "text-red-500") 
        : (trend.isPositive ? "text-green-500" : "text-red-500") 
    };
    
    return trend.direction === "up" 
      ? <TrendingUp {...iconProps} /> 
      : <TrendingDown {...iconProps} />;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="rounded-md p-2 bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
          
          {sparkData.length > 0 && (
            <div className="w-24 h-12">
              <Sparkline 
                data={sparkData} 
                color={sparkColor}
                height={20}
              >
                <SparklineSpot />
              </Sparkline>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{value}</span>
            {suffix && <span className="mr-1 text-sm text-muted-foreground">{suffix}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {renderTrendIcon()}
              <span className={`text-xs font-medium ${
                trend.direction === "up" 
                  ? (trend.isPositive ? "text-green-500" : "text-red-500") 
                  : (trend.isPositive ? "text-green-500" : "text-red-500")
              }`}>
                {trend.value}{trend.suffix}{' '}
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
