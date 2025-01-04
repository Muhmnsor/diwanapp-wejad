import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface ValidationResultProps {
  validationResult: {
    isValid: boolean;
    processedTemplate?: string;
    missingVariables?: string[];
  };
}

export const ValidationResult = ({ validationResult }: ValidationResultProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label>نتيجة التحقق:</Label>
          {validationResult.isValid ? (
            <Badge variant="outline" className="gap-1 bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-4 h-4" />
              صحيح
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-red-100 text-red-800 border-red-200">
              <XCircle className="w-4 h-4" />
              يوجد أخطاء
            </Badge>
          )}
        </div>

        {!validationResult.isValid && validationResult.missingVariables?.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              المتغيرات المفقودة: {validationResult.missingVariables.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>معاينة الرسالة:</Label>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            {validationResult.processedTemplate}
          </div>
        </div>
      </div>
    </Card>
  );
};