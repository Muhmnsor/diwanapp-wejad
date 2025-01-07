export interface RegistrationFormData {
  arabicName: string;
  email: string;
  phone: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  englishName?: string;
  educationLevel?: string;
  birthDate?: string | null;
  nationalId?: string;
  gender?: string;
  workStatus?: string;
}