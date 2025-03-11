
export const validateFormData = (formData: Record<string, any>, schema: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const fields = schema?.fields || [];
  
  if (!fields || fields.length === 0) {
    console.warn("No fields defined in schema for validation");
    return { valid: true, errors: [] };
  }
  
  fields.forEach((field: any) => {
    const fieldName = field.name;
    const fieldValue = formData[fieldName];
    
    if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      errors.push(`حقل "${field.label}" مطلوب`);
      return;
    }
    
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      return;
    }
    
    switch (field.type) {
      case 'number':
        if (isNaN(Number(fieldValue))) {
          errors.push(`حقل "${field.label}" يجب أن يكون رقماً`);
        }
        break;
        
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
          errors.push(`حقل "${field.label}" يجب أن يكون تاريخاً صحيحاً`);
        }
        break;
        
      case 'select':
        if (field.options && !field.options.includes(fieldValue)) {
          errors.push(`قيمة "${fieldValue}" غير صالحة لحقل "${field.label}"`);
        }
        break;
        
      case 'array':
        if (!Array.isArray(fieldValue)) {
          errors.push(`حقل "${field.label}" يجب أن يكون قائمة`);
        } else if (field.required && fieldValue.length === 0) {
          errors.push(`حقل "${field.label}" يجب أن يحتوي على عنصر واحد على الأقل`);
        } else if (field.subfields) {
          fieldValue.forEach((item, index) => {
            field.subfields.forEach((subfield: any) => {
              const subfieldValue = item[subfield.name];
              if (subfield.required && (subfieldValue === undefined || subfieldValue === null || subfieldValue === '')) {
                errors.push(`حقل "${subfield.label}" في العنصر ${index + 1} من "${field.label}" مطلوب`);
              }
            });
          });
        }
        break;
    }
  });
  
  console.log("Form validation results:", { valid: errors.length === 0, errors });
  return { valid: errors.length === 0, errors };
};
