
import React from "react";
import { Badge } from "@/components/ui/badge";

// Fix the Badge variant to use only allowed variant values
export function ContractsTab() {
  return (
    <div>
      {/* Use one of the allowed variant values: "default", "secondary", "destructive", or "outline" */}
      <Badge variant="outline" className="bg-green-50 text-green-700">نشط</Badge>
    </div>
  );
}
