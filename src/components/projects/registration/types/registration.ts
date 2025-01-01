export interface ProjectRegistrationFormData {
  arabicName: string;
  englishName: string;
  email: string;
  phone: string;
  educationLevel?: string;
  birthDate?: string;
  nationalId?: string;
  gender?: string;
  workStatus?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface ProjectRegistrationFieldsConfig {
  arabic_name: boolean;
  email: boolean;
  phone: boolean;
  english_name: boolean;
  education_level: boolean;
  birth_date: boolean;
  national_id: boolean;
  gender: boolean;
  work_status: boolean;
}