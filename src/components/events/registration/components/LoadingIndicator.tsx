import { Loader2 } from "lucide-react";

export const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="mr-2">جاري المعالجة...</span>
    </div>
  );
};