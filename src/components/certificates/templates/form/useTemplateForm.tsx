import { useState } from "react";
import { toast } from "sonner";
import { PDFDocument } from 'pdf-lib';

export const useTemplateForm = (template: any, onSubmit: (formData: any, selectedFile: File | null) => void) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    try {
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

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
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

  return {
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
  };
};