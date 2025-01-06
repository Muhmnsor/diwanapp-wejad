import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CertificateTemplateFields } from "./CertificateTemplateFields";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { FileUploadStep } from "./steps/FileUploadStep";
import { PageSettingsStep } from "./steps/PageSettingsStep";
import { toast } from "sonner";

interface CertificateTemplateFormProps {
  template?: any;
  isLoading: boolean;
  onSubmit: (formData: any, selectedFile: File | null) => void;
  onCancel: () => void;
}

export const CertificateTemplateForm = ({
  template,
  isLoading,
  onSubmit,
  onCancel
}: CertificateTemplateFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template_file: template?.template_file || '',
    fields: template?.fields || {},
    field_mappings: template?.field_mappings || {},
    language: template?.language || 'ar',
    orientation: template?.orientation || 'portrait',
    page_size: template?.page_size || 'A4',
    font_family: template?.font_family || 'Arial'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  console.log('CertificateTemplateForm render:', { formData, selectedFile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('File dropped:', e.dataTransfer.files[0]);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFieldsChange = (fields: Record<string, string>, fieldMappings: Record<string, string>) => {
    console.log('handleFieldsChange:', { fields, fieldMappings });
    setFormData(prev => ({
      ...prev,
      fields,
      field_mappings: fieldMappings
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error('الرجاء إدخال اسم القالب');
      return;
    }
    if (currentStep === 2 && !selectedFile && !formData.template_file) {
      toast.error('الرجاء رفع ملف القالب');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            name={formData.name}
            description={formData.description}
            onChange={handleInputChange}
          />
        );

      case 2:
        return (
          <FileUploadStep
            currentFile={formData.template_file}
            onFileSelect={setSelectedFile}
            dragActive={dragActive}
            onDrag={handleDrag}
            onDrop={handleDrop}
          />
        );

      case 3:
        return (
          <PageSettingsStep
            orientation={formData.orientation}
            pageSize={formData.page_size}
            onChange={handleInputChange}
          />
        );

      case 4:
        return (
          <CertificateTemplateFields
            fields={formData.fields}
            fieldMappings={formData.field_mappings}
            onChange={handleFieldsChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          الخطوة {currentStep} من 4
        </div>
      </div>

      {renderStepContent()}

      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              السابق
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
            >
              التالي
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : template ? 'تحديث' : 'إضافة'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};