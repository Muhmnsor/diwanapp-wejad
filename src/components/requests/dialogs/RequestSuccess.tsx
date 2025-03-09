
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export const RequestSuccess = () => {
  return (
    <Alert variant="success" className="my-4 bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertDescription>تم إرسال الطلب بنجاح وحفظه في قاعدة البيانات</AlertDescription>
    </Alert>
  );
};
