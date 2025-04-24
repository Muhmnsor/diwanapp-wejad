
// أنواع الحقول الديناميكية التي يمكن إضافتها للنموذج
export type DynamicFieldType = 
  | 'text'             // حقل نص عادي
  | 'textarea'         // حقل نص طويل
  | 'number'           // حقل رقمي
  | 'dropdown'         // قائمة منسدلة
  | 'radio'            // زر اختيار واحد
  | 'checkbox'         // مربع اختيار
  | 'file'             // ملف مرفق
  | 'date'             // تاريخ
  | 'multiselect'      // اختيار متعدد
  | 'alert'            // رسالة تنبيه
  | 'section'          // قسم / عنوان
  | 'rating'           // تقييم بالنجوم
  | 'phone';           // رقم هاتف

// خيار من خيارات الاختيار المتعدد أو القائمة المنسدلة
export interface FieldOption {
  label: string;
  value: string;
}

// حقل ديناميكي أساسي للنموذج
export interface DynamicField {
  id: string;              // معرف فريد للحقل
  type: DynamicFieldType;  // نوع الحقل
  label: string;           // عنوان الحقل
  required?: boolean;      // هل الحقل مطلوب؟
  placeholder?: string;    // نص توضيحي داخل الحقل
  description?: string;    // وصف توضيحي للحقل
  options?: FieldOption[]; // خيارات للقوائم والاختيارات المتعددة
  defaultValue?: any;      // القيمة الافتراضية
  validation?: {           // قواعد التحقق من صحة البيانات
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  config?: {               // إعدادات إضافية
    alertType?: 'info' | 'warning' | 'error' | 'success';  // نوع التنبيه
    maxFileSize?: number;                                 // الحد الأقصى لحجم الملف
    allowedFileTypes?: string[];                          // أنواع الملفات المسموح بها
  };
}

// نموذج كامل يتكون من مجموعة من الحقول الديناميكية
export interface DynamicForm {
  id: string;
  title: string;
  description?: string;
  fields: DynamicField[];
  createdAt: Date;
  updatedAt: Date;
}

// حالة البناء عند إنشاء نموذج جديد
export interface FormBuilderState {
  currentForm: DynamicForm;
  selectedFieldIndex: number | null;
  previewMode: boolean;
}
