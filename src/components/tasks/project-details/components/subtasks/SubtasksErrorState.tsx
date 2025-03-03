
import React from "react";

interface SubtasksErrorStateProps {
  error: string;
}

export const SubtasksErrorState: React.FC<SubtasksErrorStateProps> = ({ error }) => {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">المهام الفرعية</h4>
      </div>
      <div className="text-center py-3 text-sm text-red-500 border rounded-md bg-red-50">
        {error}
      </div>
    </div>
  );
};
