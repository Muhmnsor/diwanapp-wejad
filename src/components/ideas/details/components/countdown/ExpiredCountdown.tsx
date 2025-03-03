
import React from "react";

export const ExpiredCountdown: React.FC = () => {
  return (
    <div className="flex items-center gap-2 bg-amber-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-amber-800">حالة المناقشة:</span>
      <div className="font-bold text-amber-700">انتهت المناقشة</div>
    </div>
  );
};
