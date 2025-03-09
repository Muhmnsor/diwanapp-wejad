
export const validateFormData = (formData: Record<string, any>, schema: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const fields = schema?.fields || [];
  
  if (!fields || fields.length === 0) {
    console.warn("No fields defined in schema for validation");
    return { valid: true, errors: [] };
  }
  
  console.log("Validating form data:", JSON.stringify(formData, null, 2));
  console.log("Against schema fields:", JSON.stringify(fields, null, 2));
  
  // Check that all required fields are present and have valid values
  fields.forEach((field: any) => {
    const fieldName = field.name;
    const fieldValue = formData[fieldName];
    
    console.log(`Validating field "${field.label}" (${fieldName}):`, fieldValue);
    
    // Check if required field exists
    if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      errors.push(`حقل "${field.label}" مطلوب`);
      console.warn(`Required field "${field.label}" (${fieldName}) is missing or empty`);
      return;
    }
    
    // Skip validation for empty optional fields
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      console.log(`Optional field "${field.label}" (${fieldName}) is empty, skipping validation`);
      return;
    }
    
    // Type-specific validations
    switch (field.type) {
      case 'number':
        if (isNaN(Number(fieldValue))) {
          errors.push(`حقل "${field.label}" يجب أن يكون رقماً`);
          console.warn(`Field "${field.label}" (${fieldName}) is not a valid number:`, fieldValue);
        } else {
          console.log(`Field "${field.label}" (${fieldName}) is a valid number:`, fieldValue);
        }
        break;
        
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
          errors.push(`حقل "${field.label}" يجب أن يكون تاريخاً صحيحاً`);
          console.warn(`Field "${field.label}" (${fieldName}) is not a valid date:`, fieldValue);
        } else {
          console.log(`Field "${field.label}" (${fieldName}) is a valid date:`, fieldValue);
        }
        break;
        
      case 'select':
        if (field.options && !field.options.includes(fieldValue)) {
          errors.push(`قيمة "${fieldValue}" غير صالحة لحقل "${field.label}"`);
          console.warn(`Field "${field.label}" (${fieldName}) has invalid option:`, fieldValue, "Valid options:", field.options);
        } else {
          console.log(`Field "${field.label}" (${fieldName}) has a valid option:`, fieldValue);
        }
        break;
        
      case 'file':
        // For file fields, check if we have a valid file object or metadata
        if (fieldValue) {
          if (typeof fieldValue !== 'object') {
            errors.push(`حقل "${field.label}" يجب أن يكون ملفاً`);
            console.warn(`Field "${field.label}" (${fieldName}) is not a valid file object:`, fieldValue);
          } 
          // If it's a processed file object with url/path, it's valid
          else if (!fieldValue.url && !fieldValue.path && !(fieldValue instanceof File)) {
            errors.push(`صيغة الملف في حقل "${field.label}" غير صالحة`);
            console.warn(`Field "${field.label}" (${fieldName}) is not a processed file:`, fieldValue);
          } else {
            console.log(`Field "${field.label}" (${fieldName}) contains a valid file:`, 
              fieldValue instanceof File ? `File object: ${fieldValue.name}` : `Processed file: ${JSON.stringify(fieldValue)}`);
          }
        }
        break;
        
      case 'array':
        if (!Array.isArray(fieldValue)) {
          errors.push(`حقل "${field.label}" يجب أن يكون قائمة`);
          console.warn(`Field "${field.label}" (${fieldName}) is not an array:`, fieldValue);
        } else if (field.required && fieldValue.length === 0) {
          errors.push(`حقل "${field.label}" يجب أن يحتوي على عنصر واحد على الأقل`);
          console.warn(`Field "${field.label}" (${fieldName}) is an empty array`);
        } else if (field.subfields) {
          console.log(`Validating array field "${field.label}" (${fieldName}) with ${fieldValue.length} items`);
          // Validate each item in the array
          fieldValue.forEach((item, index) => {
            console.log(`Validating array item ${index + 1}:`, item);
            field.subfields.forEach((subfield: any) => {
              const subfieldValue = item[subfield.name];
              console.log(`  Validating subfield "${subfield.label}" (${subfield.name}):`, subfieldValue);
              if (subfield.required && (subfieldValue === undefined || subfieldValue === null || subfieldValue === '')) {
                errors.push(`حقل "${subfield.label}" في العنصر ${index + 1} من "${field.label}" مطلوب`);
                console.warn(`Subfield "${subfield.label}" of "${field.label}" in item ${index + 1} is missing or empty`);
              }
            });
          });
        } else {
          console.log(`Array field "${field.label}" (${fieldName}) is valid with ${fieldValue.length} items`);
        }
        break;
      
      default:
        console.log(`Field "${field.label}" (${fieldName}) has type ${field.type}, no specific validation needed`);
        break;
    }
  });
  
  console.log("Form validation results:", { valid: errors.length === 0, errors });
  return { valid: errors.length === 0, errors };
};
