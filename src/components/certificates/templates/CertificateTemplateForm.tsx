import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CertificateTemplateFields } from "./CertificateTemplateFields";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { FileUploadStep } from "./steps/FileUploadStep";
import { PageSettingsStep } from "./steps/PageSettingsStep";
import { toast } from "sonner";
import { PDFDocument } from 'pdf-lib';

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
  const [pdfFields, setPdfFields] = useState<string[]>([]);

  console.log('CertificateTemplateForm render:', { formData, selectedFile, pdfFields });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      // If there's a file, read its fields before submission
      if (selectedFile) {
        const fields = await readPDFFields(selectedFile);
        if (fields.length > 0) {
          const updatedFields = { ...formData.fields };
          fields.forEach(field => {
            if (!updatedFields[field]) {
              updatedFields[field] = '';
            }
          });
          setFormData(prev => ({
            ...prev,
            fields: updatedFields
          }));
        }
      }
      
      onSubmit(formData, selectedFile);
    } catch (error) {
      console.error('Error processing template:', error);
      toast.error('حدث خطأ أثناء معالجة القالب');
    }
  };

  const readPDFFields = async (file: File): Promise<string[]> => {
    try {
      console.log('Reading PDF fields from:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file is empty');
      }

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      if (!pdfDoc) {
        throw new Error('Failed to load PDF document');
      }

      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const fieldNames = fields.map(field => {
        const name = field.getName();
        console.log('Found field:', name, 'Type:', field.constructor.name);
        return name;
      });

      console.log('Total fields found:', fieldNames.length);
      
      if (fieldNames.length === 0) {
        toast.warning('لم يتم العثور على حقول في ملف PDF');
      } else {
        toast.success(`تم العثور على ${fieldNames.length} حقل`);
        setPdfFields(fieldNames);
      }
      
      return fieldNames;
    } catch (error) {
      console.error('Error reading PDF fields:', error);
      toast.error('حدث خطأ أثناء قراءة حقول ملف PDF');
      return [];
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('الرجاء إدخال اسم القالب');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('الرجاء إدخال وصف القالب');
          return false;
        }
        return true;

      case 2:
        if (!selectedFile && !formData.template_file) {
          toast.error('الرجاء رفع ملف القالب');
          return false;
        }
        return true;

      case 3:
        if (!formData.orientation) {
          toast.error('الرجاء تحديد اتجاه الصفحة');
          return false;
        }
        if (!formData.page_size) {
          toast.error('الرجاء تحديد حجم الصفحة');
          return false;
        }
        if (!formData.font_family) {
          toast.error('الرجاء تحديد نوع الخط');
          return false;
        }
        return true;

      case 4:
        if (Object.keys(formData.fields).length === 0) {
          toast.warning('لم يتم إضافة أي حقول للقالب');
          if (!confirm('هل تريد المتابعة بدون إضافة حقول؟')) {
            return false;
          }
        }
        return true;

      default:
        return true;
    }
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
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('يجب أن يكون الملف بصيغة PDF');
        return;
      }
      console.log('File dropped:', file);
      setSelectedFile(file);
      toast.success('تم رفع الملف بنجاح');
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

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    // If moving from file upload step, read PDF fields
    if (currentStep === 2 && selectedFile) {
      await readPDFFields(selectedFile);
    }
    
    const nextStep = currentStep + 1;
    if (nextStep <= 4) {
      setCurrentStep(nextStep);
      toast.success(`الخطوة ${nextStep} من 4`);
    }
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      toast.info(`الخطوة ${prevStep} من 4`);
    }
  };

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
          {getStepTitle(currentStep)} - الخطوة {currentStep} من 4
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