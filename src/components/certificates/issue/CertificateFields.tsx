import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

interface CertificateFieldsProps {
  certificateData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  fieldMappings?: Record<string, string>;
  registrationData?: Record<string, any>;
}

export const CertificateFields = ({ 
  certificateData, 
  onFieldChange,
  fieldMappings = {},
  registrationData = {}
}: CertificateFieldsProps) => {
  
  // Auto-fill mapped fields when registration data changes
  useEffect(() => {
    if (!registrationData) return;

    Object.entries(fieldMappings).forEach(([key, mapping]) => {
      if (mapping && mapping.includes('.')) {
        const [source, field] = mapping.split('.');
        if (source === 'registration' && registrationData[field]) {
          onFieldChange(key, registrationData[field]);
        }
      }
    });
  }, [registrationData, fieldMappings, onFieldChange]);

  return (
    <div className="space-y-4">
      {Object.entries(certificateData).map(([key, value]) => {
        const isMapped = fieldMappings[key];
        
        return (
          <div key={key} className="space-y-2">
            <Label>{key}</Label>
            <Input
              value={value}
              onChange={(e) => onFieldChange(key, e.target.value)}
              placeholder={`أدخل ${key}`}
              className={isMapped ? "bg-gray-50" : ""}
              readOnly={false} // Allow editing even mapped fields
            />
            {isMapped && (
              <p className="text-sm text-muted-foreground">
                (مربوط تلقائياً: {fieldMappings[key]})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};