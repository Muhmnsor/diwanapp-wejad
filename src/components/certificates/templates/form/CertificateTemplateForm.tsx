
import { useTemplateForm } from "./useTemplateForm";
import { StepIndicator } from "./StepIndicator";
import { StepNavigation } from "./StepNavigation";
import { BasicInfoStep } from "../steps/BasicInfoStep";
import { FileUploadStep } from "../steps/FileUploadStep";
import { PageSettingsStep } from "../steps/PageSettingsStep";
import { CertificateTemplateFields } from "../CertificateTemplateFields";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Fetch all template categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['certificate-template-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('certificate_templates')
        .select('category')
        .not('category', 'is', null);
      
      if (!data) return ["عام"];
      
      const categories = [...new Set(data.map(item => item.category || 'عام'))];
      return categories.length ? categories : ["عام"];
    },
    initialData: ["عام"]
  });

  const {
    currentStep,
    formData,
    selectedFile,
    dragActive,
    pdfFields,
    handleSubmit,
    handleNext,
    handleBack,
    handleDrag,
    handleDrop,
    handleFieldsChange,
    handleInputChange,
    setSelectedFile
  } = useTemplateForm(template, onSubmit);

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'المعلومات الأساسية';
      case 2:
        return 'رفع ملف القالب';
      case 3:
        return 'إعدادات الصفحة';
      case 4:
        return 'إعداد الحقول';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            name={formData.name}
            description={formData.description}
            category={formData.category || "عام"}
            categories={categoriesData}
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
            pdfFields={pdfFields}
          />
        );

      case 3:
        return (
          <PageSettingsStep
            orientation={formData.orientation}
            pageSize={formData.page_size}
            fontFamily={formData.font_family}
            onChange={handleInputChange}
          />
        );

      case 4:
        return (
          <CertificateTemplateFields
            fields={formData.fields}
            fieldMappings={formData.field_mappings}
            pdfFields={pdfFields}
            onChange={handleFieldsChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StepIndicator 
        currentStep={currentStep} 
        stepTitle={getStepTitle(currentStep)} 
      />

      {renderStepContent()}

      <StepNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={currentStep === 4}
        template={template}
      />
    </form>
  );
};
