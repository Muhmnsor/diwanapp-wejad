import { AlertCircle } from "lucide-react";

export const UnderDevelopment = () => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
        <h2 className="text-2xl font-semibold">قيد التطوير</h2>
        <p className="text-gray-600">هذه الصفحة قيد التطوير حالياً</p>
      </div>
    </div>
  );
};