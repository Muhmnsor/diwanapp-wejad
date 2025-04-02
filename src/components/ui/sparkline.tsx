
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[];
  color?: string;
  height?: number;
  limit?: number;
  children?: ReactNode;
}

export function Sparkline({
  data,
  color = "#4ade80",
  height = 30,
  limit,
  children,
  className,
  ...props
}: SparklineProps) {
  // Don't render sparkline if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <div className={cn("w-full h-[30px] flex items-center justify-center text-muted-foreground text-xs", className)} {...props}>
        No data available
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Sparklines data={data} limit={limit} height={height} margin={5}>
        <SparklinesLine color={color} />
        {children}
      </Sparklines>
    </div>
  );
}

interface SparklineSpotProps {
  size?: number;
  spotColors?: {
    endSpot?: string;
    spotColor?: string;
  };
}

export function SparklineSpot({
  size = 4,
  spotColors = {
    endSpot: "#4ade80",
    spotColor: "rgba(74, 222, 128, 0.6)"
  }
}: SparklineSpotProps) {
  // The SparklinesSpots component needs data to be available,
  // but it gets its data from its parent Sparklines context
  // We need to ensure it's only rendered when there's valid data in the parent
  return (
    <SparklinesSpots
      size={size}
      style={{ 
        fill: spotColors.spotColor, 
        strokeWidth: 0 
      }}
      spotColors={{
        endSpot: spotColors.endSpot
      }}
    />
  );
}
