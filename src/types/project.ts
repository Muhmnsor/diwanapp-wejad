
export interface Project {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  max_attendees: number;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: "male" | "female" | "both";
  certificate_type: string;
  event_path: "environment" | "health" | "social" | "other";
  event_category: "social" | "cultural" | "sports" | "educational";
  registration_start_date: string | null;
  registration_end_date: string | null;
  registration_fields: {
    arabic_name: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    email: boolean;
    phone: boolean;
    gender: boolean;
    work_status: boolean;
  };
  // إضافة حقل للنماذج المخصصة
  customForm?: {
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      description?: string;
      options?: Array<{
        label: string;
        value: string;
      }>;
      config?: {
        alertType?: string;
        maxFileSize?: number;
        allowedFileTypes?: string[];
      };
    }>;
  };
}
