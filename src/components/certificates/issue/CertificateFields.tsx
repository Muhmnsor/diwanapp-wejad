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

    console.log('Processing field mappings:', fieldMappings);
    console.log('With registration data:', registrationData);

    Object.entries(fieldMappings).forEach(([key, mapping]) => {
      if (mapping && mapping.includes('.')) {
        const [source, field] = mapping.split('.');
        console.log(`Processing mapping: ${key} -> ${source}.${field}`);
        
        if (source === 'registration' && registrationData[field]) {
          console.log(`Setting ${key} to ${registrationData[field]}`);
          onFieldChange(key, registrationData[field]);
        }
      }
    });
  }, [registrationData, fieldMappings, onFieldChange]);

  return (
    <div className="space-y-4">
      {Object.entries(certificateData).map(([key, value]) => {
        const isMapped = fieldMappings[key];
        const mappingInfo = isMapped ? fieldMappings[key].split('.') : null;
        const mappingLabel = mappingInfo ? 
          `مربوط تلقائياً مع ${mappingInfo[0] === 'registration' ? 'بيانات التسجيل' : mappingInfo[0]}: ${mappingInfo[1]}` : 
          null;
        
        return (
          <div key={key} className="space-y-2">
            <Label>{key}</Label>
            <Input
              value={value}
              onChange={(e) => onFieldChange(key, e.target.value)}
              placeholder={`أدخل ${key}`}
              className={isMapped ? "bg-gray-50" : ""}
              readOnly={isMapped ? true : false}
            />
            {mappingLabel && (
              <p className="text-sm text-muted-foreground">
                ({mappingLabel})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};