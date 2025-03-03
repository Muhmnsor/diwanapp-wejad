
import React from "react";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";

interface StatusDisplayProps {
  status: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  // سجل معلومات العرض للتصحيح
  console.log(`🏷️ عرض الحالة: "${status}" (${typeof status})`);
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
