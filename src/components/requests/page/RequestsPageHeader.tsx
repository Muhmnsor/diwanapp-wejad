
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RequestsPageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
}

export const RequestsPageHeader: React.FC<RequestsPageHeaderProps> = ({ 
  title, 
  description,
  onRefresh
}) => {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      )}
    </div>
  );
};
