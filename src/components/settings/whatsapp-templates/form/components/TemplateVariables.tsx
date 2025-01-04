import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface TemplateVariablesProps {
  notificationType: string;
  placeholders: Record<string, string[]>;
}

export const TemplateVariables = ({ notificationType, placeholders }: TemplateVariablesProps) => {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        المتغيرات المتاحة:{' '}
        {placeholders[notificationType as keyof typeof placeholders]?.join(', ')}
      </AlertDescription>
    </Alert>
  );
};