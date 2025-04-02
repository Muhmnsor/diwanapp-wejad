
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
  // تأكد من أن البيانات صالحة وغير فارغة
  const validData = Array.isArray(data) && data.length > 0 ? data : [0, 0];
  
  return (
    <div className={cn("w-full", className)} {...props}>
      <Sparklines data={validData} limit={limit} height={height} margin={5}>
        <SparklinesLine color={color} />
        {/* تمرير الأطفال فقط إذا كانوا موجودين */}
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
  // SparklinesSpots تفشل إذا تم استدعاؤها بدون بيانات صالحة
  try {
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
  } catch (error) {
    console.error("Error rendering SparklinesSpots:", error);
    return null;
  }
}
