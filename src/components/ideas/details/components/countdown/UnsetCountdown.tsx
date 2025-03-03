
import React from "react";

export const UnsetCountdown: React.FC = () => {
  return (
    <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-purple-800">المناقشة:</span>
      <div className="font-bold text-purple-700">غير محددة</div>
    </div>
  );
};
